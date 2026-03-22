// ============================================================
// Netlify Function: generate-image
// Proxy sécurisé vers Gemini Nano Banana (image generation)
// Modèle : gemini-2.0-flash-exp avec responseModalities IMAGE
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
    const { prompt, ratio, referenceImageBase64 } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Clé API Google non configurée sur le serveur.' }, { status: 500 });
    }

    // Build request parts
    const parts: any[] = [];

    if (referenceImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: referenceImageBase64,
        },
      });
    }

    parts.push({ text: prompt });

    // Use gemini-2.0-flash-exp with IMAGE responseModality
    const model = 'gemini-2.0-flash-exp';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    console.log(`[generate-image] Calling ${model} with prompt length: ${prompt.length}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generate-image] API Error ${response.status}:`, errorText);
      
      let errorMsg = `Erreur API Google: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {}
      
      return Response.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate?.content?.parts) {
      const blockReason = data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || 'unknown';
      console.error('[generate-image] No content. Reason:', blockReason);
      return Response.json(
        { error: `Aucune image générée. Raison: ${blockReason}. Essayez un prompt différent.` },
        { status: 500 },
      );
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        console.log('[generate-image] Image generated successfully');
        return Response.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }

    const textResponse = candidate.content.parts.map((p: any) => p.text).filter(Boolean).join(' ');
    console.error('[generate-image] Only text returned:', textResponse.substring(0, 200));
    return Response.json(
      { error: `Le modèle n'a pas généré d'image. Réponse texte: ${textResponse.substring(0, 200)}` },
      { status: 500 },
    );
  } catch (error: any) {
    console.error('[generate-image] Error:', error);
    return Response.json(
      { error: error.message || 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
};

export const config = {
  path: '/.netlify/functions/generate-image',
};
