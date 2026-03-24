// ============================================================
// Netlify Function: proxy-image
// Proxy sécurisé pour charger des images externes (contourne CORS)
// Usage: POST { url: "https://example.com/logo.png" }
// Retourne: { imageBase64, mimeType }
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
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL manquante.' }, { status: 400 });
    }

    // Validation basique de l'URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return Response.json({ error: 'URL invalide.' }, { status: 400 });
    }

    // Limiter la taille (10MB max)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MediapostStudio/2.0)',
        'Accept': 'image/*,*/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return Response.json(
        { error: `Impossible de charger l'image: HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Vérifier la taille (max 5MB)
    if (bytes.length > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image trop volumineuse (max 5MB).' }, { status: 413 });
    }

    // Convertir en base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Déterminer le mime type
    let mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/')) {
      // Essayer de détecter via les magic bytes
      if (bytes[0] === 0x89 && bytes[1] === 0x50) mimeType = 'image/png';
      else if (bytes[0] === 0xFF && bytes[1] === 0xD8) mimeType = 'image/jpeg';
      else if (bytes[0] === 0x47 && bytes[1] === 0x49) mimeType = 'image/gif';
      else if (bytes[0] === 0x52 && bytes[1] === 0x49) mimeType = 'image/webp';
      else if (new TextDecoder().decode(bytes.slice(0, 5)).includes('<svg') || 
               new TextDecoder().decode(bytes.slice(0, 100)).includes('<svg')) mimeType = 'image/svg+xml';
      else mimeType = 'image/png';
    }

    console.log(`[proxy-image] ${url} → ${mimeType} (${bytes.length}B)`);

    return Response.json({ imageBase64: base64, mimeType });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return Response.json({ error: 'Timeout: image trop lente à charger.' }, { status: 504 });
    }
    console.error('[proxy-image] Error:', error);
    return Response.json({ error: error.message || 'Erreur serveur.' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/proxy-image',
  method: 'POST',
};
