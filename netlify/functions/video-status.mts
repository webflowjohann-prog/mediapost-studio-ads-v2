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
      return new Response(JSON.stringify({ error: 'jobId manquant.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const store = getStore({ name: "video-jobs", consistency: "strong" });
    const job = await store.get(jobId, { type: 'json' });

    if (!job) {
      return new Response(JSON.stringify({ status: 'pending', progress: 'Initialisation...' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(job), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[video-status] Error:', error);
    return new Response(JSON.stringify({ status: 'pending', progress: 'Chargement...' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/.netlify/functions/video-status',
};
