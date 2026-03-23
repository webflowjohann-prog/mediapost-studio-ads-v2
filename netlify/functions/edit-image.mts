// ============================================================
// Netlify Function: edit-image
// Modifie une image existante via Gemini Nano Banana 2
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
    const { imageBase64, prompt, referenceImageBase64 } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Clé API Google non configurée.' }, { status: 500 });
    }

    const parts: any[] = [
      { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    ];

    if (referenceImageBase64) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: referenceImageBase64 } });
    }

    parts.push({ text: `EDIT INSTRUCTION: ${prompt}. Maintain photorealism. Maintain product proportions. Do not alter any text or logo overlays.` });

    const model = 'gemini-3.1-flash-image-preview';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Erreur API: ${response.status}`;
      try { errorMsg = JSON.parse(errorText).error?.message || errorMsg; } catch {}
      return Response.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate?.content?.parts) {
      return Response.json({ error: 'Modification échouée (réponse vide).' }, { status: 500 });
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return Response.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }

    return Response.json({ error: "Pas d'image dans la réponse." }, { status: 500 });
  } catch (error: any) {
    console.error('[edit-image] Error:', error);
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/edit-image',
  method: 'POST',
};
