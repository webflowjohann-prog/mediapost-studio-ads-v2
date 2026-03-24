// ============================================================
// Netlify Function: video-status
// Poll le statut d'un job vidéo depuis Netlify Blobs
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return Response.json({ error: 'jobId manquant.' }, { status: 400 });
    }

    const store = getStore({ name: "video-jobs", consistency: "strong" });
    const job = await store.get(jobId, { type: 'json' });

    if (!job) {
      return Response.json({ status: 'pending', progress: 'Initialisation...' });
    }

    return Response.json(job);
  } catch (error: any) {
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};
