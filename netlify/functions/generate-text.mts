// ============================================================
// Netlify Function: generate-text
// Proxy sécurisé vers Gemini pour texte/slogans
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
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Clé API Google non configurée.' }, { status: 500 });
    }

    let prompt = '';

    if (body.type === 'slogans') {
      prompt = `Génère 5 slogans publicitaires courts pour une campagne de marketing local. Marque : "Le pouvoir de la proximité". Produits: ${body.productNames.join(', ')}. Ambiance: ${body.mood}. Style : communication de proximité, chaleureux. Réponds en JSON: un array de strings.`;
    } else if (body.type === 'scene_suggestions') {
      const productNames = body.products.map((p: any) => p.name).join(', ');
      prompt = `Génère 4 suggestions courtes et inspirantes de scènes de vie réalistes pour une campagne de communication de proximité mettant en avant : ${productNames}. Les scènes doivent évoquer la convivialité, le quotidien et la proximité. Réponds en JSON: un array de strings.`;
    } else {
      return Response.json({ error: 'Type de requête non supporté.' }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini text error:', errorText);
      return Response.json({ error: `Erreur Gemini: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // Parse JSON from response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: string[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = [];
    }

    if (body.type === 'slogans') {
      return Response.json({ slogans: parsed });
    } else {
      return Response.json({ suggestions: parsed });
    }
  } catch (error: any) {
    console.error('generate-text error:', error);
    return Response.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/generate-text',
};
