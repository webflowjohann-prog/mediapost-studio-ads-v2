// ============================================================
// Netlify Function: generate-video
// Proxy vers Google Veo 3.1 via predictLongRunning (REST API)
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
    const aspectRatio = ratio === '9:16' ? '9:16' : '16:9';

    const videoPrompt = `Cinematic video. ACTION: ${prompt}. Photorealistic, smooth motion. Do not morph the main object.`;

    // Build request body for predictLongRunning
    const instance: any = { prompt: videoPrompt };

    // Add image using bytesBase64Encoded format
    if (imageBase64) {
      instance.image = {
        bytesBase64Encoded: imageBase64,
        mimeType: 'image/png',
      };
    }

    const requestBody = {
      instances: [instance],
      parameters: {
        aspectRatio,
      },
    };

    console.log(`[generate-video] Starting ${model}, ratio ${aspectRatio}, hasImage: ${!!imageBase64}`);

    // Step 1: Start video generation via predictLongRunning
    const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
    const startRes = await fetch(
      `${BASE_URL}/models/${model}:predictLongRunning?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      },
    );

    if (!startRes.ok) {
      const errorText = await startRes.text();
      console.error('[generate-video] Start error:', startRes.status, errorText);
      let errorMsg = `Erreur Veo ${startRes.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) errorMsg = errorJson.error.message;
      } catch {}
      return Response.json({ error: errorMsg }, { status: startRes.status });
    }

    let operation = await startRes.json();
    const operationName = operation.name;
    console.log('[generate-video] Operation:', operationName);

    if (!operationName) {
      return Response.json({ error: 'Pas d\'opération retournée par Veo.' }, { status: 500 });
    }

    // Step 2: Poll until done (max 5 min)
    const maxWait = 300000;
    const pollInterval = 10000;
    let elapsed = 0;

    while (!operation.done && elapsed < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));
      elapsed += pollInterval;

      const pollRes = await fetch(
        `${BASE_URL}/${operationName}?key=${apiKey}`,
      );
      if (!pollRes.ok) {
        console.error('[generate-video] Poll error:', pollRes.status);
        return Response.json({ error: 'Erreur lors du polling vidéo.' }, { status: 500 });
      }
      operation = await pollRes.json();
      console.log(`[generate-video] Poll ${elapsed / 1000}s - done: ${operation.done}`);
    }

    if (!operation.done) {
      return Response.json({ error: 'Timeout: la vidéo a pris trop de temps (5min max).' }, { status: 504 });
    }

    if (operation.error) {
      console.error('[generate-video] Error:', JSON.stringify(operation.error));
      return Response.json({ error: `Erreur vidéo: ${operation.error.message || JSON.stringify(operation.error)}` }, { status: 500 });
    }

    // Step 3: Extract video URI
    // Response format: response.generateVideoResponse.generatedSamples[0].video.uri
    const videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

    if (!videoUri) {
      console.error('[generate-video] No video URI:', JSON.stringify(operation.response));
      return Response.json({ error: 'Pas de vidéo dans la réponse.' }, { status: 500 });
    }

    console.log('[generate-video] Downloading:', videoUri.substring(0, 80));

    // Step 4: Download video
    const separator = videoUri.includes('?') ? '&' : '?';
    const videoRes = await fetch(`${videoUri}${separator}key=${apiKey}`);
    if (!videoRes.ok) {
      // Try with x-goog-api-key header instead
      const videoRes2 = await fetch(videoUri, {
        headers: { 'x-goog-api-key': apiKey },
      });
      if (!videoRes2.ok) {
        return Response.json({ error: 'Erreur téléchargement vidéo.' }, { status: 500 });
      }
      const buf = await videoRes2.arrayBuffer();
      return Response.json({ videoBase64: Buffer.from(buf).toString('base64'), mimeType: 'video/mp4' });
    }

    const videoBuffer = await videoRes.arrayBuffer();
    console.log('[generate-video] Downloaded:', videoBuffer.byteLength, 'bytes');

    return Response.json({
      videoBase64: Buffer.from(videoBuffer).toString('base64'),
      mimeType: 'video/mp4',
    });
  } catch (error: any) {
    console.error('[generate-video] Error:', error);
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
};
