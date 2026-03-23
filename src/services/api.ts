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

// --- Helper: Call Netlify Function ---
async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Erreur ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// --- Prompt Builders (client-side, no secret needed) ---

export function buildImagePrompt(state: FormState, spec: OutputSpec): string {
  const { productChoice, customScenePrompt } = state;

  // Build product context from custom fields
  const productName = productChoice.custom.name || 'Produit';
  const productDescription = productChoice.custom.description || '';
  const hasProductImage = !!productChoice.custom.image_url;

  const scenePrompt = customScenePrompt || 'A clean, professional marketing setting with natural lighting.';

  return `
    **ROLE:** Expert Product & Advertising Photographer for local marketing campaigns ("${BRAND.tagline}").
    
    **TASK:** Create a photorealistic marketing image featuring: ${productName}.
    ${productDescription ? `**PRODUCT CONTEXT:** ${productDescription}` : ''}
    
    ${hasProductImage ? `**CRITICAL - REFERENCE IMAGE:** An image of the actual product is provided as input. The product in the generated image MUST look EXACTLY like the reference image. Same packaging, same colors, same labels, same shape. Do NOT invent a different product. Reproduce the product faithfully in the scene.` : ''}
    
    **SCENE:** ${scenePrompt}
    
    **STRICT VISUAL RULES:**
    1. The product MUST be life-sized and realistic. DO NOT make it giant or distorted.
    2. All textures must be hyperrealistic, appetizing, and photographic quality.
    3. The product is the hero of the composition, clearly visible and well-lit.
    4. DO NOT add any text, logo, watermark, or overlay on the image. The image must be clean.
    5. NO AI artifacts, NO glitches, NO distorted text.
    
    **TECHNICAL:**
    - Camera: Full-frame, 50mm f/2.8, professional studio lighting
    - Color grade: Warm, inviting, commercial quality
    - Format: ${spec.ratio} (${spec.px[0]}x${spec.px[1]}px)
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

// --- Video Generation ---

export async function generateVideo(
  imageBase64: string,
  prompt: string,
  ratio: string,
  quality: string,
): Promise<{ videoUrl?: string; videoBase64?: string }> {
  return callFunction('generate-video', {
    imageBase64,
    prompt,
    ratio,
    quality,
  });
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
