'use server';

import apifyClient from '@/lib/apify';

export interface ScraperInputOptions {
  searchStringsArray?: string[];      // Múltiples palabras clave (ej: ["Restaurantes", "Bares"])
  query?: string;                     // Búsqueda por término único ("Odontólogos en Madrid")
  locationQuery?: string;             // Filtro de ubicación ("Madrid, España")
  maxCrawledPlacesPerSearch?: number; // Límite por búsqueda (default 50)
  limit?: number;                     // Alias de maxCrawledPlacesPerSearch
  language?: string;                  // Idioma ("es", "en", "pt")
  countryCode?: string;               // Código de país ("es", "co", "mx", "us")
  skipClosedPlaces?: boolean;         // Omitir negocios cerrados permanentemente (default true)
  scrapeWebsite?: boolean;            // Extraer sitio web (default true)
  scrapeEmailsAndSocialMedia?: boolean; // Extraer emails y redes (default true)
}

/**
 * Server Action para lanzar la extracción B2B en la nube de Apify (compass/crawler-google-places).
 * Soporta invocación por string ("Restaurantes en Bogotá", 50) o por objeto rico ScraperInputOptions.
 */
export async function triggerGoogleMapsScraper(
  queryOrOptions: string | ScraperInputOptions,
  legacyLimit: number = 50
) {
  try {
    let options: ScraperInputOptions = {};

    if (typeof queryOrOptions === 'string') {
      options = {
        query: queryOrOptions,
        limit: legacyLimit,
      };
    } else if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
      options = queryOrOptions;
    }

    // Normalizar términos de búsqueda
    const searchStrings = options.searchStringsArray && options.searchStringsArray.length > 0
      ? options.searchStringsArray
      : options.query ? [options.query.trim()] : [];

    if (searchStrings.length === 0 && !options.locationQuery) {
      return {
        success: false,
        error: 'Debes proporcionar al menos un término de búsqueda o una ubicación.',
      };
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      console.error('[ApifyTrigger] APIFY_API_TOKEN no configurado en variables de entorno.');
      return {
        success: false,
        error: 'Falta configurar APIFY_API_TOKEN en las variables de entorno de Dokploy.',
      };
    }

    const processorWebhookUrl = process.env.PROCESSOR_WEBHOOK_URL;
    const secretToken = process.env.WEBHOOK_SECRET_TOKEN || 'xX6+0+EuTlUynI/USQli6I14OgrVg3dAqnrzTkuOV8w=';

    console.log(`[ApifyTrigger] Solicitud recibida: searchStrings=${JSON.stringify(searchStrings)}, location="${options.locationQuery || ''}"`);

    if (!processorWebhookUrl) {
      console.warn('⚠️ [ApifyTrigger] ALERTA CRÍTICA: PROCESSOR_WEBHOOK_URL no está configurada en las variables de entorno del CRM en Dokploy!');
    }

    // Formatear la URL del Webhook incluyendo la clave secreta por Query Parameter (?secret=...)
    let formattedWebhookUrl = processorWebhookUrl;
    if (formattedWebhookUrl && !formattedWebhookUrl.includes('secret=')) {
      const separator = formattedWebhookUrl.includes('?') ? '&' : '?';
      formattedWebhookUrl = `${formattedWebhookUrl}${separator}secret=${encodeURIComponent(secretToken)}`;
    }

    const webhooks = formattedWebhookUrl
      ? [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED' as any],
            requestUrl: formattedWebhookUrl,
          },
        ]
      : undefined;

    // Configurar payload completo para compass/crawler-google-places
    const apifyInput = {
      searchStringsArray: searchStrings.length > 0 ? searchStrings : undefined,
      locationQuery: options.locationQuery || undefined,
      maxCrawledPlacesPerSearch: Math.max(1, options.maxCrawledPlacesPerSearch || options.limit || 50),
      language: options.language || 'es',
      countryCode: options.countryCode ? options.countryCode.toLowerCase() : undefined,
      skipClosedPlaces: options.skipClosedPlaces ?? true,
      scrapeWebsite: options.scrapeWebsite ?? true,
      scrapeEmailsAndSocialMedia: options.scrapeEmailsAndSocialMedia ?? true,
      oneReviewPerKey: false,
    };

    // Iniciar ejecución asíncrona no bloqueante en Apify Cloud
    const run = await apifyClient.actor('compass/crawler-google-places').start(
      apifyInput,
      {
        webhooks,
      }
    );

    console.log(`[ApifyTrigger] Actor iniciado en Apify Cloud con éxito. Run ID: ${run.id}, Status: ${run.status}, Dataset ID: ${run.defaultDatasetId}`);

    return {
      success: true,
      data: {
        runId: run.id,
        defaultDatasetId: run.defaultDatasetId,
        status: run.status,
      },
    };
  } catch (error: any) {
    console.error('[ApifyTrigger] Error al iniciar el actor de Apify:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Error al iniciar la extracción en la nube de Apify.',
    };
  }
}

/**
 * Server Action para consultar el estado actual de una ejecución en Apify por su runId.
 */
export async function getScraperRunStatus(runId: string) {
  try {
    if (!runId) {
      return { success: false, status: 'UNKNOWN', error: 'Run ID requerido.' };
    }

    const run = await apifyClient.run(runId).get();

    return {
      success: true,
      data: {
        status: run?.status || 'UNKNOWN',
        finishedAt: run?.finishedAt,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 'UNKNOWN',
      error: error?.message || 'Error al consultar estado del run.',
    };
  }
}

/**
 * Server Action para solicitar al backend la ingesta manual de un Dataset de Apify por su ID.
 */
export async function ingestManualDataset(datasetId: string) {
  try {
    if (!datasetId || datasetId.trim().length === 0) {
      return {
        success: false,
        message: 'El Dataset ID es obligatorio.',
      };
    }

    const backendUrl = process.env.BACKEND_API_URL || process.env.PROCESSOR_WEBHOOK_URL?.replace(/\/webhooks\/apify\/leads.*$/, '') || 'http://72.62.161.199:3001';

    console.log(`[ManualIngest] Enviando petición a ${backendUrl}/api/datasets/process con datasetId="${datasetId.trim()}"`);

    const response = await fetch(`${backendUrl}/api/datasets/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        datasetId: datasetId.trim(),
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.error || data.message || `Error del servidor backend (HTTP ${response.status}).`,
      };
    }

    return {
      success: true,
      message: data.message || 'Ingesta manual del dataset iniciada correctamente en segundo plano.',
    };
  } catch (error: any) {
    console.error('[ManualIngest] Error de conexión con el backend:', error?.message || error);
    return {
      success: false,
      message: `Error al conectar con el backend: ${error?.message || 'Error de red.'}`,
    };
  }
}
