// ============================================================
// Netlify Function: generate-video (SYNC - 10s timeout)
// 1. Reçoit l'image + prompt du client
// 2. Stocke l'image dans Netlify Blobs (contourne limite body BG)
// 3. Déclenche la background function avec juste le jobId
// 4. Retourne le jobId immédiatement
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
    const { imageBase64, prompt, ratio, quality } = await request.json();
    const jobId = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log(`[generate-video] Job ${jobId}: storing image in Blobs...`);

    // Store the full payload in Blobs (sync function can handle large bodies)
    const store = getStore({ name: "video-jobs", consistency: "strong" });
    await store.setJSON(jobId, {
      status: "pending",
      progress: "Initialisation...",
      payload: { imageBase64, prompt, ratio, quality },
    });

    console.log(`[generate-video] Job ${jobId}: triggering background function...`);

    // Trigger background function with just the jobId (tiny body = no size limit issue)
    const url = new URL(request.url);
    const bgUrl = `${url.origin}/.netlify/functions/generate-video-background`;

    fetch(bgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }).catch((err) => {
      console.error('[generate-video] Trigger failed:', err.message);
    });

    console.log(`[generate-video] Job ${jobId}: launched OK`);

    return new Response(JSON.stringify({ jobId, status: 'started' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[generate-video] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erreur interne.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
};
