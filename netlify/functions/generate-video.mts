// ============================================================
// Netlify Function: generate-video
// Proxy sécurisé vers Google Veo 3.1
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
    const { imageBase64, prompt, ratio, quality } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Clé API Google non configurée.' }, { status: 500 });
    }

    const model = quality === 'pro' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    const resolution = quality === 'pro' ? '1080p' : '720p';
    const aspectRatio = ratio === '16:9' ? '16:9' : '9:16';

    const videoPrompt = `
      Cinematic video. 
      ACTION: ${prompt}.
      QUALITY: Photorealistic, 8k, slow smooth motion.
      CONSTRAINT: Do not morph the main object. Keep the product static in shape.
    `.trim();

    // Step 1: Start video generation
    const startRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateVideos?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          image: imageBase64 ? { imageBytes: imageBase64, mimeType: 'image/png' } : undefined,
          config: {
            numberOfVideos: 1,
            resolution,
            aspectRatio,
          },
        }),
      },
    );

    if (!startRes.ok) {
      const errorText = await startRes.text();
      console.error('Veo start error:', errorText);
      return Response.json({ error: `Erreur Veo: ${startRes.status}` }, { status: startRes.status });
    }

    let operation = await startRes.json();

    // Step 2: Poll until done (max 5 min)
    const maxWait = 300000;
    const pollInterval = 8000;
    let elapsed = 0;

    while (!operation.done && elapsed < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));
      elapsed += pollInterval;

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operation.name}?key=${apiKey}`,
      );
      if (!pollRes.ok) {
        return Response.json({ error: 'Erreur lors du polling de la vidéo.' }, { status: 500 });
      }
      operation = await pollRes.json();
    }

    if (!operation.done) {
      return Response.json({ error: 'Timeout: la vidéo a pris trop de temps.' }, { status: 504 });
    }

    if (operation.error) {
      return Response.json({ error: `Erreur vidéo: ${JSON.stringify(operation.error)}` }, { status: 500 });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return Response.json({ error: 'Pas de vidéo dans la réponse.' }, { status: 500 });
    }

    // Step 3: Download video and return as base64
    const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
    if (!videoRes.ok) {
      return Response.json({ error: 'Erreur téléchargement vidéo.' }, { status: 500 });
    }

    const videoBuffer = await videoRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');

    return Response.json({
      videoBase64,
      mimeType: 'video/mp4',
    });
  } catch (error: any) {
    console.error('generate-video error:', error);
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
};
