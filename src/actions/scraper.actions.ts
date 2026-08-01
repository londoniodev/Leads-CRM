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
      console.warn('APIFY_API_TOKEN no está definido en las variables de entorno.');
    }

    const run = await apifyClient.actor('compass/google-maps-scraper').call({
      searchStringsArray: [query.trim()],
      maxCrawledPlacesPerSearch: Math.max(1, limit),
    });

    return {
      success: true,
      data: {
        runId: run.id,
        defaultDatasetId: run.defaultDatasetId,
        status: run.status,
      },
    };
  } catch (error: any) {
    console.error('Error al invocar actor de Apify:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Error al iniciar la extracción en la nube de Apify.',
    };
  }
}
