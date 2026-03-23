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
  const { productChoice, stylePreset, contextMode, contextPromptFreeform, customScenePrompt } = state;

  const selectedProducts = productChoice.preset_product_ids
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  if (productChoice.preset_product_ids.includes('CUSTOM') && state.productChoice.custom.name) {
    selectedProducts.push({
      id: 'CUSTOM',
      label: state.productChoice.custom.name,
      category: 'autre',
      image_url: state.productChoice.custom.image_url,
    });
  }

  const productNames = selectedProducts.map(p => p!.label).join(', ');
  const style = STYLE_PRESETS[stylePreset].details;
  const context = contextMode === 'FREEFORM' ? contextPromptFreeform : CONTEXT_MODES[contextMode].template;

  let finalSurface = style.surface;
  let customSceneInstruction = '';

  if (customScenePrompt) {
    finalSurface = `SCÈNE DÉFINIE PAR L'UTILISATEUR : ${customScenePrompt}`;
    customSceneInstruction = `IMPERATIVE: USER SCENE OVERRIDE. The environment MUST match this description strictly: "${customScenePrompt}".`;
  }

  return `
    **ROLE:** Expert Food & Product Photographer for ${BRAND.tagline}.
    **TASK:** Create a photorealistic marketing image for a local marketing campaign containing: ${productNames}.
    
    **STRICT VISUAL RULES:**
    1. **REALISTIC SCALE:** The product MUST be life-sized. DO NOT make it giant.
    2. **TEXTURES:** All textures must be hyperrealistic and appetizing.
    3. **COMPOSITION:** The product is the hero, placed naturally on: ${finalSurface}.
    
    **STYLE (${stylePreset}):**
    - Camera: ${style.camera}
    - Light: ${style.light}
    - Color Grade: ${style.grade}
    
    **CONTEXT:** ${context}
    ${customSceneInstruction}
    
    **BRANDING:**
    - Colors: ${BRAND.color_palette.primary}, ${BRAND.color_palette.secondary.join(', ')}.
    - Vibe: ${BRAND.tokens.slice(0, 3).join(', ')}.
    - NO AI TEXT. NO GLITCHES.
    
    **FORMAT:** ${spec.ratio} (${spec.px[0]}x${spec.px[1]}px)
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
