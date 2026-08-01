'use server';

import apifyClient from '@/lib/apify';

export async function triggerGoogleMapsScraper(query: string, limit: number = 50) {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: 'El término de búsqueda es obligatorio.',
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
    const secretToken = process.env.WEBHOOK_SECRET_TOKEN || 'dev_secret_token_123';

    console.log(`[ApifyTrigger] Solicitud recibida: query="${query.trim()}", limit=${limit}`);
    console.log(`[ApifyTrigger] Webhook URL configurada: "${processorWebhookUrl || 'NINGUNA (PROCESSOR_WEBHOOK_URL no definida)'}"`);

    const webhooks = processorWebhookUrl
      ? [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED' as any],
            requestUrl: processorWebhookUrl,
            headersTemplate: JSON.stringify({
              'x-webhook-secret': secretToken,
            }),
          },
        ]
      : undefined;

    // Iniciar ejecución asíncrona no bloqueante usando .start() con webhook ACTOR.RUN.SUCCEEDED y autenticación secret header
    const run = await apifyClient.actor('compass/crawler-google-places').start(
      {
        searchStringsArray: [query.trim()],
        maxCrawledPlacesPerSearch: Math.max(1, limit),
      },
      {
        webhooks,
      }
    );

    console.log(`[ApifyTrigger] Actor iniciado en Apify Cloud con éxito. Run ID: ${run.id}, Status: ${run.status}`);

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
