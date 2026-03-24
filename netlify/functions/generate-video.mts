// ============================================================
// Netlify Function: generate-video
// Lance un job vidéo en background et retourne le jobId
// Le client poll ensuite via video-status
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

    // Get the base URL for the background function
    const url = new URL(request.url);
    const bgUrl = `${url.origin}/.netlify/functions/generate-video-background`;

    // Fire and forget — call the background function
    fetch(bgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, jobId }),
    }).catch(() => {});

    // Return immediately with the job ID
    return Response.json({ jobId, status: 'started' });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
  method: 'POST',
};
