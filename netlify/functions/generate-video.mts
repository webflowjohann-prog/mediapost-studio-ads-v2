// ============================================================
// Netlify Function: generate-video (synchrone, retour immédiat)
// Stocke le job dans Blobs, déclenche la background function,
// retourne le jobId au client instantanément
// ============================================================
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await request.json();
    const jobId = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Store initial job status
    const store = getStore({ name: "video-jobs", consistency: "strong" });
    await store.setJSON(jobId, { status: "pending", progress: "Initialisation..." });

    // Trigger background function (fire and forget)
    const url = new URL(request.url);
    const bgUrl = `${url.origin}/.netlify/functions/generate-video-background`;

    // Don't await — fire and forget
    fetch(bgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, jobId }),
    }).catch((err) => {
      console.error('[generate-video] Failed to trigger background:', err.message);
    });

    // Return immediately
    return Response.json({ jobId, status: 'started' });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};
