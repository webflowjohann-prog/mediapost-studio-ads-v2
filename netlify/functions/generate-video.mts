// ============================================================
// Netlify Function: generate-video (synchrone, retour immédiat)
// Génère un jobId, trigger la background function, retourne
// ============================================================

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

    // Trigger background function (fire and forget)
    const url = new URL(request.url);
    const bgUrl = `${url.origin}/.netlify/functions/generate-video-background`;

    console.log(`[generate-video] Launching job ${jobId}, triggering ${bgUrl}`);

    // Fire and forget — don't await
    fetch(bgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, jobId }),
    }).catch((err) => {
      console.error('[generate-video] Trigger failed:', err.message);
    });

    // Return immediately with jobId
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
