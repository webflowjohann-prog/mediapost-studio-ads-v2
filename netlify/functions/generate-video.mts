// ============================================================
// Netlify Function: generate-video (SYNC - 10s timeout)
// Step 1 of 2: Stores the large payload in Netlify Blobs
// and returns a jobId. The CLIENT then calls the background
// function directly (not this function).
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

    console.log(`[generate-video] Job ${jobId}: storing payload in Blobs (${Math.round((imageBase64?.length || 0) / 1024)}kB image)...`);

    const store = getStore({ name: "video-jobs", consistency: "strong" });
    await store.setJSON(jobId, {
      status: "pending",
      progress: "Payload stocké. En attente du lancement...",
      payload: { imageBase64, prompt, ratio, quality },
    });

    console.log(`[generate-video] Job ${jobId}: stored OK. Client will trigger BG function.`);

    return new Response(JSON.stringify({ jobId, status: 'stored' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('[generate-video] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erreur interne.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
};
