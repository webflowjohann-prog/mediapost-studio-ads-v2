// ============================================================
// MEDIAPOST STUDIO ADS V2 — Types
// ============================================================

// --- Product & Catalog ---
export type ProductCategory = 'flyer' | 'affiche' | 'digital' | 'courrier' | 'autre';

export interface Product {
  id: string;
  label: string;
  image_url: string;
  category: ProductCategory;
  description?: string;
}

// --- Style & Context ---
export type StylePresetId = 'CORPORATE_PRO' | 'LIFESTYLE_CONVIVIAL' | 'SOCIAL_TOPDOWN';
export type ContextModeId = 'PROMO_LIMITED_TIME' | 'FAMILY_MEAL' | 'NEW_PRODUCT' | 'DELIVERY_APP' | 'IN_STORE_MENU' | 'FREEFORM';
export type OutputPackId = 'SOCIAL_SQUARE' | 'CATALOG' | 'POST_VERTICAL' | 'STORY' | 'WEB_HERO' | 'PRINT_FLYER';

// --- Output Spec ---
export interface OutputSpec {
  ratio: string;
  px: [number, number];
  format: string;
  quality: number;
  dpi?: number;
}

// --- Overlays ---
interface BaseOverlay {
  id: string;
  x: number;
  y: number;
}

export interface LogoOverlay extends BaseOverlay {
  type: 'logo';
  url: string;
  size: number;
  rotation: number;
}

export interface TextOverlay extends BaseOverlay {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  scale: number;
  rotation: number;
  colorHex: string;
  shadow: boolean;
  bannerEnabled: boolean;
  bannerColorHex: string;
  bannerPadding: number;
  bannerBorderRadius: number;
  skewX: number;
  skewY: number;
}

export type Overlay = LogoOverlay | TextOverlay;

// --- Form State (Quick ADS Studio) ---
export interface FormState {
  productChoice: {
    preset_product_ids: string[];
    custom: {
      name: string;
      image_url: string;
      description: string;
    };
  };
  stylePreset: StylePresetId;
  contextMode: ContextModeId;
  contextPromptFreeform: string;
  customScenePrompt: string;
  outputPack: OutputPackId[];
  overlays: Overlay[];
  consistencySeed: string;
}

// --- Generated Assets ---
export interface GeneratedImage {
  id: OutputPackId;
  url: string;
  history: string[];
  label: string;
  spec: OutputSpec;
  overlays: Overlay[];
  videoUrl?: string;
  isVideoLoading?: boolean;
  videoGenerationError?: string;
}

// --- Avatar Platform ---
export interface Avatar {
  id: string;
  name: string;
  category: 'male' | 'female' | 'character';
  imageUrl: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface AvatarProduct {
  name: string;
  base64: string;
  mimeType: string;
}

export type CustomOutfit = AvatarProduct;

export type AvatarTab = 'Choisir les Avatars' | 'Personnaliser les Avatars' | 'Scène & Ambiance';
export type CameraAngle = 'Vue de face' | 'Profil' | 'Trois-quarts' | 'Contre-plongée' | 'Plongée';
export type CameraZoom = 'Gros plan' | 'Plan américain' | 'Plan moyen' | 'Plan large';
export type DepthOfField = 'Faible' | 'Moyenne' | 'Élevée';
export type AspectRatio = '16:9' | '9:16';
export type VideoQuality = 'Rapide (720p)' | 'Haute Qualité (1080p)';
export type ProductInteraction = 'Tenir en main' | 'Placer à côté' | 'Regarder le produit' | 'Prompt Libre';
export type Tone = 'Automatique' | 'Joyeux' | 'Sérieux' | 'Calme' | 'Énergique' | 'Professionnel';
export type AudioQuality = 'Standard' | 'Studio (Voix claire)' | 'Naturel (Ambiance subtile)';

export interface AvatarConfig {
  id: string;
  avatar: Avatar;
  clothingStyle: string;
  wardrobeDescription: string;
  textScript: string;
  product: AvatarProduct | null;
  productInteraction: ProductInteraction;
  productInteractionPrompt: string;
}

export interface GenerationParams {
  avatarConfigs: AvatarConfig[];
  language: Language;
  universePrompt: string;
  cameraAngle: CameraAngle;
  cameraZoom: CameraZoom;
  depthOfField: DepthOfField;
  tone: Tone;
  aspectRatio: AspectRatio;
  audioQuality: AudioQuality;
  videoQuality: VideoQuality;
  sharedOutfit: CustomOutfit | null;
  avatarArrangement: string[];
  universeImage: AvatarProduct | null;
}

// --- API Responses ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ImageGenerationResponse {
  imageBase64: string;
  mimeType: string;
}

export interface VideoGenerationResponse {
  videoUrl: string;
}

// --- Supabase DB Types ---
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  brand_config: Record<string, unknown>;
  form_state: FormState;
  created_at: string;
  updated_at: string;
}

export interface GeneratedAsset {
  id: string;
  campaign_id: string;
  type: 'image' | 'video';
  output_pack_id: OutputPackId;
  storage_path: string;
  overlays: Overlay[];
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- Navigation ---
export type AppView = 'hub' | 'quick_ads' | 'avatar_platform';
