// ============================================================
// Netlify Function: video-status
// Poll le statut d'un job vidéo depuis Netlify Blobs
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return Response.json({ error: 'jobId manquant.' }, { status: 400 });
    }

    const store = getStore("video-jobs");
    const job = await store.get(jobId, { type: 'json' });

    if (!job) {
      return Response.json({ status: 'pending', progress: 'Initialisation...' });
    }

    // Si le job est terminé, nettoyer le blob après lecture
    if (job.status === 'done' || job.status === 'error') {
      // On laisse le blob 5 min avant de le supprimer (au cas où le client re-poll)
      // Pas de cleanup immédiat
    }

    return Response.json(job);
  } catch (error: any) {
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/video-status',
};
