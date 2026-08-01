'use server';

import apifyClient from '@/lib/apify';

export interface ScraperInputOptions {
  source?: 'GOOGLE_MAPS' | 'INSTAGRAM' | 'TIKTOK' | string;
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
  minRating?: number;                 // Calificación mínima en estrellas (ej. 3.0, 4.0, 4.5)
  onlyWithWebsite?: boolean;          // Solo extraer sitios con página web oficial
  enrichSocial?: boolean;             // Forzar enriquecimiento profundo de perfiles en Instagram/TikTok
}

/**
 * Limpia y sanitiza strings de URL eliminando sintaxis de corchetes markdown [...](...) o comillas extra
 */
function cleanUrlString(rawUrl?: string): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;

  const match = rawUrl.match(/https?:\/\/[^\s\]\)"']+/i);
  if (match) {
    return match[0].trim();
  }

  return rawUrl.trim();
}

/**
 * Helper para construir webhook URL con token de autenticación
 */
function buildWebhookUrl(baseUrl?: string): string | undefined {
  const cleaned = cleanUrlString(baseUrl);
  if (!cleaned) return undefined;

  const secretToken = process.env.WEBHOOK_SECRET_TOKEN || 'xX6+0+EuTlUynI/USQli6I14OgrVg3dAqnrzTkuOV8w=';
  if (!cleaned.includes('secret=')) {
    const separator = cleaned.includes('?') ? '&' : '?';
    return `${cleaned}${separator}secret=${encodeURIComponent(secretToken)}`;
  }
  return cleaned;
}

/**
 * Server Action principal de enrutamiento de extracción B2B agnóstico a la fuente (Google Maps, Instagram, TikTok).
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
        source: 'GOOGLE_MAPS',
      };
    } else if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
      options = queryOrOptions;
    }

    const source = options.source || 'GOOGLE_MAPS';

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

    const limitValue = Math.max(1, options.maxCrawledPlacesPerSearch || options.limit || 50);
    const searchTermsString = searchStrings.join(', ');

    // URL base de Webhooks
    const rawSocialSeedWebhook = process.env.PROCESSOR_WEBHOOK_URL_SOCIAL_SEED || process.env.PROCESSOR_WEBHOOK_URL?.replace(/\/webhooks\/apify\/leads.*$/, '/webhooks/apify/social-seed') || 'http://72.62.161.199:3001/webhooks/apify/social-seed';
    const formattedSocialSeedWebhookUrl = buildWebhookUrl(rawSocialSeedWebhook);
    const socialSeedWebhooks = formattedSocialSeedWebhookUrl
      ? [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED' as any],
            requestUrl: formattedSocialSeedWebhookUrl,
          },
        ]
      : undefined;

    // Enrutador de fuentes
    switch (source) {
      case 'INSTAGRAM': {
        console.log(`[ScraperRouter] 📸 Ejecutando apify/instagram-search-scraper para term="${searchTermsString}" (Limit: ${limitValue})`);
        
        const instagramInput = {
          search: searchTermsString,
          searchType: 'user',
          resultsType: 'details',
          resultsLimit: limitValue,
        };

        const run = await apifyClient.actor('apify/instagram-search-scraper').start(
          instagramInput,
          { webhooks: socialSeedWebhooks }
        );

        console.log(`[ScraperRouter] Actor Instagram iniciado con éxito. Run ID: ${run.id}, Status: ${run.status}`);

        return {
          success: true,
          data: {
            runId: run.id,
            defaultDatasetId: run.defaultDatasetId,
            status: run.status,
          },
        };
      }

      case 'TIKTOK': {
        console.log(`[ScraperRouter] 🎵 Ejecutando clockworks/tiktok-scraper para term="${searchTermsString}" (Limit: ${limitValue})`);

        const tiktokInput = {
          searchQueries: searchStrings,
          resultsPerPage: limitValue,
        };

        const run = await apifyClient.actor('clockworks/tiktok-scraper').start(
          tiktokInput,
          { webhooks: socialSeedWebhooks }
        );

        console.log(`[ScraperRouter] Actor TikTok iniciado con éxito. Run ID: ${run.id}, Status: ${run.status}`);

        return {
          success: true,
          data: {
            runId: run.id,
            defaultDatasetId: run.defaultDatasetId,
            status: run.status,
          },
        };
      }

      case 'GOOGLE_MAPS':
      default: {
        const rawWebhookUrl = process.env.PROCESSOR_WEBHOOK_URL;
        const formattedWebhookUrl = buildWebhookUrl(rawWebhookUrl);

        console.log(`[ApifyTrigger] Solicitud GOOGLE_MAPS recibida: searchStrings=${JSON.stringify(searchStrings)}, location="${options.locationQuery || ''}"`);

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
          maxCrawledPlacesPerSearch: limitValue,
          language: options.language || 'es',
          countryCode: options.countryCode ? options.countryCode.toLowerCase() : undefined,
          skipClosedPlaces: options.skipClosedPlaces ?? true,
          scrapeWebsite: options.scrapeWebsite ?? true,
          scrapeEmailsAndSocialMedia: options.scrapeEmailsAndSocialMedia ?? true,
          minRating: typeof options.minRating === 'number' && options.minRating > 0 ? options.minRating : undefined,
          onlyWithWebsite: options.onlyWithWebsite ?? false,
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
      }
    }
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

    const rawBackendUrl = process.env.BACKEND_API_URL || process.env.PROCESSOR_WEBHOOK_URL?.replace(/\/webhooks\/apify\/leads.*$/, '') || 'http://72.62.161.199:3001';
    const backendUrl = cleanUrlString(rawBackendUrl) || 'http://72.62.161.199:3001';

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
