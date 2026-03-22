// ============================================================
// Netlify Function: generate-image
// Proxy sécurisé vers Google Imagen 3 (Nano/Banana)
// La clé API Google est côté serveur uniquement
// ============================================================

export default async (request: Request) => {
  // CORS
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

    // Map ratio to Imagen 3 supported ratios
    const ratioMap: Record<string, string> = {
      '1:1': '1:1',
      '4:5': '3:4',
      '9:16': '9:16',
      '16:9': '16:9',
      '3:2': '4:3',
    };
    const aspectRatio = ratioMap[ratio] || '1:1';

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

    // Call Gemini API with image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            imageMimeType: 'image/png',
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      return Response.json(
        { error: `Erreur API Google: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate?.content?.parts) {
      return Response.json(
        { error: "Aucune image n'a été générée (réponse vide ou bloquée)." },
        { status: 500 },
      );
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return Response.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }

    return Response.json(
      { error: "Aucune image dans la réponse du modèle." },
      { status: 500 },
    );
  } catch (error: any) {
    console.error('generate-image error:', error);
    return Response.json(
      { error: error.message || 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
};

export const config = {
  path: '/.netlify/functions/generate-image',
};
