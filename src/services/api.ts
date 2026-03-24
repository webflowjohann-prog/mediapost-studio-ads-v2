// ============================================================
// MEDIAPOST STUDIO ADS V2 — API Service
// Toutes les requêtes passent par les Netlify Functions
// La clé API Google n'est JAMAIS exposée côté client
// ============================================================
import type {
  FormState, OutputSpec, GenerationParams, Language, AudioQuality,
} from '../types';
import { BRAND, CONTEXT_MODES, PRODUCTS, STYLE_PRESETS } from '../constants';

const API_BASE = '/.netlify/functions';

// --- Helper: Call Netlify Function with timeout + auto-retry on 504 ---
async function callFunction<T>(name: string, body: Record<string, unknown>, timeoutMs = 55000, maxRetries = 1): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 0) {
        console.log(`[callFunction] Retry ${attempt}/${maxRetries} for ${name}...`);
        // Wait before retry to let server cool down
        await new Promise(r => setTimeout(r, 3000));
      }

      const res = await fetch(`${API_BASE}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.status === 504) {
        lastError = new Error(`Timeout serveur (504) sur "${name}".`);
        if (attempt < maxRetries) {
          console.warn(`[callFunction] 504 on ${name}, will retry...`);
          continue;
        }
        throw lastError;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || `Erreur ${res.status}: ${res.statusText}`);
      }

      return res.json();
    } catch (e: any) {
      if (e.name === 'AbortError') {
        lastError = new Error(`Timeout client sur "${name}". Essayez avec moins de formats.`);
        if (attempt < maxRetries) continue;
        throw lastError;
      }
      if (attempt < maxRetries && (e.message?.includes('504') || e.message?.includes('Timeout'))) {
        lastError = e;
        continue;
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Erreur inconnue');
}

// --- Prompt Builders (client-side, no secret needed) ---

export function buildImagePrompt(state: FormState, spec: OutputSpec): string {
  const { productChoice, customScenePrompt } = state;

  const productName = productChoice.custom.name || 'Produit';
  const productDescription = productChoice.custom.description || '';
  const hasProductImage = !!productChoice.custom.image_url;

  const scenePrompt = customScenePrompt || 'Clean professional marketing setting, natural soft lighting.';

  if (hasProductImage) {
    // Prompt spécifique quand on a une image de référence du produit
    return `
STRICT PRODUCT PHOTOGRAPHY BRIEF.

THE REFERENCE IMAGE (Image 1) shows the EXACT product: "${productName}".
${productDescription ? `Product context: ${productDescription}.` : ''}

ABSOLUTE RULES FOR THE PRODUCT:
- REPRODUCE the product from Image 1 with 100% visual fidelity.
- SAME exact colors, SAME packaging, SAME labels, SAME shape, SAME proportions.
- DO NOT change the product color. If it is white, it stays white. If red, stays red.
- DO NOT add or remove any element from the product.
- DO NOT invent a different product. The output MUST contain the EXACT same product as Image 1.

SCENE: ${scenePrompt}

COMPOSITION RULES:
- The product is the central hero, occupying 30-50% of the frame.
- Place it naturally in the described scene.
- Photorealistic quality, shot on full-frame camera, 50mm f/2.8, soft studio lighting.
- NO text, NO logo, NO watermark on the image. Output a clean photograph only.
- NO AI artifacts or distortions.
- Format: ${spec.ratio}
    `.trim();
  }

  // Prompt sans image de référence (text-only)
  return `
PRODUCT PHOTOGRAPHY BRIEF.

Product: "${productName}".
${productDescription ? `Context: ${productDescription}.` : ''}

SCENE: ${scenePrompt}

Create a photorealistic marketing photograph of this product in the described scene.
- Product is the central hero, naturally integrated.
- Photorealistic, shot on full-frame camera, 50mm f/2.8, soft natural lighting.
- NO text, NO logo, NO watermark. Clean photograph only.
- NO AI artifacts.
- Format: ${spec.ratio}
  `.trim();
}

// --- Image Generation ---

export async function generateImage(
  prompt: string,
  ratio: string,
  referenceImageBase64?: string,
): Promise<{ imageBase64: string }> {
  return callFunction('generate-image', {
    prompt,
    ratio,
    referenceImageBase64,
  });
}

// --- Image Editing ---

export async function editImage(
  imageBase64: string,
  prompt: string,
  referenceImageBase64?: string,
): Promise<{ imageBase64: string }> {
  return callFunction('edit-image', {
    imageBase64,
    prompt,
    referenceImageBase64,
  });
}

// --- Video Generation (async: sync launcher stores in Blobs, background processes) ---

export async function generateVideo(
  imageBase64: string,
  prompt: string,
  ratio: string,
  quality: string,
  onProgress?: (msg: string) => void,
): Promise<{ videoBase64: string }> {
  onProgress?.('Lancement de la génération vidéo...');

  // Step 1: Call sync function (stores image in Blobs + triggers background)
  const launchRes = await fetch(`${API_BASE}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, ratio, quality }),
  });

  if (!launchRes.ok) {
    const err = await launchRes.json().catch(() => ({ error: `HTTP ${launchRes.status}` }));
    throw new Error(err.error || `Erreur lancement vidéo: ${launchRes.status}`);
  }

  const { jobId } = await launchRes.json();
  if (!jobId) throw new Error('Pas de jobId retourné.');

  onProgress?.('Veo traite votre vidéo...');

  // Step 2: Poll video-status until done (max 8 min)
  const maxPollTime = 480000;
  const pollInterval = 6000;
  let elapsed = 0;

  // Wait 10s before first poll
  await new Promise(r => setTimeout(r, 10000));
  elapsed += 10000;

  while (elapsed < maxPollTime) {
    try {
      const res = await fetch(`${API_BASE}/video-status?jobId=${encodeURIComponent(jobId)}`);
      if (res.ok) {
        const status = await res.json();

        if (status.status === 'done' && status.videoBase64) {
          onProgress?.('Vidéo prête !');
          return { videoBase64: status.videoBase64 };
        }

        if (status.status === 'error') {
          throw new Error(status.error || 'Erreur lors de la génération vidéo.');
        }

        onProgress?.(status.progress || `Génération en cours... ${Math.round(elapsed / 1000)}s`);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Failed') && !e.message.includes('NetworkError')) {
        throw e;
      }
    }

    await new Promise(r => setTimeout(r, pollInterval));
    elapsed += pollInterval;
  }

  throw new Error('Timeout: la vidéo a pris trop de temps (8 min max).');
}

// --- Text Generation (Slogans, Scene Suggestions) ---

export async function generateSlogans(
  productNames: string[],
  mood: string,
): Promise<string[]> {
  const res = await callFunction<{ slogans: string[] }>('generate-text', {
    type: 'slogans',
    productNames,
    mood,
  });
  return res.slogans;
}

export async function generateSceneSuggestions(
  products: { name: string; category: string }[],
): Promise<string[]> {
  const res = await callFunction<{ suggestions: string[] }>('generate-text', {
    type: 'scene_suggestions',
    products,
  });
  return res.suggestions;
}

// --- Avatar Video Generation ---

export async function generateAvatarVideo(
  params: GenerationParams,
  onProgress: (msg: string) => void,
): Promise<string> {
  onProgress('Préparation des assets...');

  const res = await callFunction<{ videoUrl: string }>('generate-video', {
    type: 'avatar',
    params: {
      ...params,
      avatarConfigs: params.avatarConfigs.map(c => ({
        ...c,
        avatar: { ...c.avatar },
      })),
    },
  });

  return res.videoUrl;
}

// --- TTS ---

export async function generateAudio(
  text: string,
  language: Language,
  quality: AudioQuality,
): Promise<string> {
  const res = await callFunction<{ audioBase64: string }>('generate-audio', {
    text,
    language: language.code,
    quality,
  });

  const binaryString = atob(res.audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/pcm' }));
}
