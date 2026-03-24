// ============================================================
// Netlify Function: generate-video
// Proxy sécurisé vers Google Veo 3.1 (Gemini API)
// Fix: correct image format (bytesBase64Encoded) + model name
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

    // Use generate-preview for both (fast model may not be available)
    const model = 'veo-3.1-generate-preview';
    const aspectRatio = ratio === '9:16' ? '9:16' : '16:9';

    const videoPrompt = `Cinematic video. ACTION: ${prompt}. QUALITY: Photorealistic, smooth motion. CONSTRAINT: Do not morph the main object. Keep the product static in shape.`;

    // Build request body
    const requestBody: any = {
      prompt: videoPrompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
      },
    };

    // Add image if provided — use bytesBase64Encoded format (NOT inlineData)
    if (imageBase64) {
      requestBody.image = {
        bytesBase64Encoded: imageBase64,
        mimeType: 'image/png',
      };
    }

    console.log(`[generate-video] Starting with model ${model}, ratio ${aspectRatio}`);

    // Step 1: Start video generation
    const startRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateVideos?key=${apiKey}`,
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
    console.log('[generate-video] Operation started:', operation.name);

    // Step 2: Poll until done (max 5 min)
    const maxWait = 300000;
    const pollInterval = 10000;
    let elapsed = 0;

    while (!operation.done && elapsed < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));
      elapsed += pollInterval;

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operation.name}?key=${apiKey}`,
      );
      if (!pollRes.ok) {
        console.error('[generate-video] Poll error:', pollRes.status);
        return Response.json({ error: 'Erreur lors du polling vidéo.' }, { status: 500 });
      }
      operation = await pollRes.json();
      console.log(`[generate-video] Poll ${elapsed/1000}s - done: ${operation.done}`);
    }

    if (!operation.done) {
      return Response.json({ error: 'Timeout: la vidéo a pris trop de temps (5min max).' }, { status: 504 });
    }

    if (operation.error) {
      console.error('[generate-video] Operation error:', JSON.stringify(operation.error));
      return Response.json({ error: `Erreur vidéo: ${operation.error.message || JSON.stringify(operation.error)}` }, { status: 500 });
    }

    // Step 3: Get video URI and download
    const generatedVideos = operation.response?.generatedVideos;
    const videoUri = generatedVideos?.[0]?.video?.uri;

    if (!videoUri) {
      console.error('[generate-video] No video URI in response:', JSON.stringify(operation.response));
      return Response.json({ error: 'Pas de vidéo dans la réponse.' }, { status: 500 });
    }

    console.log('[generate-video] Downloading video from:', videoUri.substring(0, 80));

    const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
    if (!videoRes.ok) {
      // Try without appending key (some URIs already have it)
      const videoRes2 = await fetch(videoUri);
      if (!videoRes2.ok) {
        return Response.json({ error: 'Erreur téléchargement vidéo.' }, { status: 500 });
      }
      const videoBuffer = await videoRes2.arrayBuffer();
      const videoBase64 = Buffer.from(videoBuffer).toString('base64');
      return Response.json({ videoBase64, mimeType: 'video/mp4' });
    }

    const videoBuffer = await videoRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');

    console.log('[generate-video] Video downloaded, size:', videoBuffer.byteLength);

    return Response.json({ videoBase64, mimeType: 'video/mp4' });
  } catch (error: any) {
    console.error('[generate-video] Error:', error);
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/generate-video',
};
