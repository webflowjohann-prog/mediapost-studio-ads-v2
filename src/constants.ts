// ============================================================
// MEDIAPOST STUDIO ADS V2 — Constants
// ============================================================
import type {
  Product, StylePresetId, ContextModeId, OutputPackId, OutputSpec,
  Avatar, Language, Tone, AudioQuality, CameraAngle, CameraZoom,
  DepthOfField, AspectRatio, VideoQuality, ProductInteraction,
} from './types';

// --- Brand ---
export const BRAND = {
  name: 'Mediapost',
  site_url: 'https://www.mediaposte.fr',
  default_logo_url: 'https://www.mediaposte.fr/wp-content/uploads/2024/09/LogoFull.svg',
  tagline: 'Le pouvoir de la proximité',
  color_palette: {
    primary: '#E9041E',
    secondary: ['#FFFFFF', '#004990'],
    accent: ['#FFD100', '#008000'],
  },
  tokens: [
    'communication de proximité',
    'marketing local',
    'distribution boîte aux lettres',
    'campagnes digitales',
    'proximité et confiance',
    'rouge Mediapost et bleu institutionnel',
  ],
} as const;

// --- AI Models (Google API) ---
export const MODELS = {
  TEXT: 'gemini-2.5-flash',
  IMAGE: 'imagen-3.0-generate-002',
  VIDEO_FAST: 'veo-3.1-fast-generate-preview',
  VIDEO_PRO: 'veo-3.1-generate-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
} as const;

// --- Products (Demo catalog) ---
export const MAX_PRODUCTS = 3;

export const PRODUCTS: Product[] = [
  {
    id: 'flyer_promo',
    label: 'Flyer Promotionnel',
    image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    category: 'flyer',
  },
  {
    id: 'courrier_direct',
    label: 'Courrier Adressé',
    image_url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
    category: 'courrier',
  },
  {
    id: 'affiche_vitrine',
    label: 'Affiche Vitrine',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80',
    category: 'affiche',
  },
  {
    id: 'banniere_web',
    label: 'Bannière Web',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: 'digital',
  },
  {
    id: 'post_social',
    label: 'Post Réseaux Sociaux',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    category: 'digital',
  },
  {
    id: 'catalogue_local',
    label: 'Catalogue Local',
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    category: 'flyer',
  },
];

// --- Style Presets ---
export const STYLE_PRESETS: Record<StylePresetId, { label: string; description: string; details: Record<string, string> }> = {
  CORPORATE_PRO: {
    label: 'Corporate & Pro',
    description: 'Style institutionnel propre, fond uni, éclairage studio.',
    details: {
      camera: 'full-frame, 50mm, f/4',
      light: 'softbox large, éclairage uniforme et rassurant',
      surface: 'fond uni blanc ou rouge Mediapost, surface propre',
      grade: 'couleurs fidèles, contraste professionnel',
      composition: 'produit centré, espace pour texte légal',
    },
  },
  LIFESTYLE_CONVIVIAL: {
    label: 'Lifestyle & Convivial',
    description: 'Lumière naturelle, mise en situation réelle.',
    details: {
      camera: 'full-frame, 85mm, f/2.8',
      light: 'lumière du jour, chaleureux',
      surface: 'table en bois, nappe, environnement domestique ou urbain',
      grade: 'vibrant, accueillant',
      composition: 'produit en situation de consommation',
    },
  },
  SOCIAL_TOPDOWN: {
    label: 'Social Media (Top-Down)',
    description: 'Vue de dessus, dynamique et graphique.',
    details: {
      camera: 'full-frame, 35mm top-down, f/5.6',
      light: 'éclairage homogène sans ombres dures',
      surface: 'surface texturée ou colorée pop',
      grade: 'saturé, contrasté pour mobile',
      composition: 'flatlay avec accessoires',
    },
  },
};

// --- Context Modes ---
export const CONTEXT_MODES: Record<ContextModeId, { label: string; template: string }> = {
  PROMO_LIMITED_TIME: { label: 'Offre Promotionnelle', template: "Mise en avant d'une réduction forte (-50%, 1 acheté = 1 offert), urgence, texte impactant type flyer boite aux lettres." },
  FAMILY_MEAL: { label: 'Ambiance Famille', template: 'Repas partagé, convivialité, plusieurs produits, chaleur humaine, idéal pour catalogue.' },
  NEW_PRODUCT: { label: 'Lancement Produit', template: "Focus héroïque sur le produit seul, nouveauté, qualité des ingrédients." },
  DELIVERY_APP: { label: 'Digital / App', template: 'Format carré optimisé pour mobile, produit détouré ou sur fond simple, lisibilité maximale.' },
  IN_STORE_MENU: { label: 'Affichage Local', template: "Format affiche abribus ou vitrine, haute résolution, incitation au trafic en point de vente." },
  FREEFORM: { label: 'Libre (Prompt perso)', template: '' },
};

// --- Output Specs ---
export const OUTPUT_SPECS: Record<OutputPackId, OutputSpec> = {
  SOCIAL_SQUARE: { ratio: '1:1', px: [1200, 1200], format: 'PNG', quality: 95 },
  CATALOG: { ratio: '1:1', px: [1080, 1080], format: 'PNG', quality: 95 },
  POST_VERTICAL: { ratio: '4:5', px: [1080, 1350], format: 'PNG', quality: 95 },
  STORY: { ratio: '9:16', px: [1080, 1920], format: 'PNG', quality: 95 },
  WEB_HERO: { ratio: '16:9', px: [1920, 1080], format: 'PNG', quality: 95 },
  PRINT_FLYER: { ratio: '3:2', px: [3000, 2000], format: 'PNG', quality: 95, dpi: 300 },
};

export const OUTPUT_PACK_OPTIONS: { id: OutputPackId; label: string }[] = [
  { id: 'SOCIAL_SQUARE', label: 'Carré Social (1:1)' },
  { id: 'CATALOG', label: 'Catalogue Produit (1:1)' },
  { id: 'POST_VERTICAL', label: 'Post Vertical (4:5)' },
  { id: 'STORY', label: 'Story / TikTok (9:16)' },
  { id: 'WEB_HERO', label: 'Bannière Site (16:9)' },
  { id: 'PRINT_FLYER', label: 'Affiche / Flyer (3:2)' },
];

export const OUTPUT_PACK_LABELS: Record<OutputPackId, string> = {
  SOCIAL_SQUARE: 'Carré Social',
  CATALOG: 'Catalogue Produit',
  POST_VERTICAL: 'Post Vertical',
  STORY: 'Story Mobile',
  WEB_HERO: 'Bannière Web',
  PRINT_FLYER: 'Affiche / Flyer',
};

// --- Font Options ---
export const FONT_OPTIONS: { id: string; label: string }[] = [
  { id: 'DM Sans', label: 'DM Sans (Classique)' },
  { id: 'Anton', label: 'Anton (Impact)' },
  { id: 'Oswald', label: 'Oswald (Condensé)' },
  { id: 'Roboto Slab', label: 'Roboto Slab (Moderne)' },
  { id: 'Work Sans', label: 'Work Sans (Pro)' },
  { id: 'Fredoka', label: 'Fredoka (Arrondi)' },
  { id: 'Pacifico', label: 'Pacifico (Manuscrit)' },
];

// --- Avatars ---
export const AVATARS: Avatar[] = [
  { id: 'm1', name: 'Ethan', category: 'male', imageUrl: 'https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'm2', name: 'Liam', category: 'male', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'm3', name: 'Noah', category: 'male', imageUrl: 'https://images.pexels.com/photos/7752850/pexels-photo-7752850.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'm4', name: 'Justin', category: 'male', imageUrl: 'https://images.unsplash.com/photo-1563854944858-f95fe8bdd897?auto=format&fit=crop&w=400&q=80' },
  { id: 'm5', name: 'Anthony', category: 'male', imageUrl: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'm6', name: 'Stéphane', category: 'male', imageUrl: 'https://images.pexels.com/photos/7518927/pexels-photo-7518927.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'f1', name: 'Olivia', category: 'female', imageUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'f2', name: 'Emma', category: 'female', imageUrl: 'https://images.pexels.com/photos/3021538/pexels-photo-3021538.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'f3', name: 'Ava', category: 'female', imageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'f4', name: 'Ambre', category: 'female', imageUrl: 'https://images.pexels.com/photos/31848879/pexels-photo-31848879.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

// --- Languages ---
export const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

// --- Avatar Options ---
export const TONES: readonly Tone[] = ['Automatique', 'Joyeux', 'Sérieux', 'Calme', 'Énergique', 'Professionnel'];
export const AUDIO_QUALITIES: readonly AudioQuality[] = ['Standard', 'Studio (Voix claire)', 'Naturel (Ambiance subtile)'];
export const CAMERA_ANGLES: readonly CameraAngle[] = ['Vue de face', 'Profil', 'Trois-quarts', 'Contre-plongée', 'Plongée'];
export const CAMERA_ZOOMS: readonly CameraZoom[] = ['Gros plan', 'Plan américain', 'Plan moyen', 'Plan large'];
export const DEPTH_OF_FIELDS: readonly DepthOfField[] = ['Faible', 'Moyenne', 'Élevée'];
export const ASPECT_RATIOS: readonly AspectRatio[] = ['16:9', '9:16'];
export const VIDEO_QUALITIES: readonly VideoQuality[] = ['Rapide (720p)', 'Haute Qualité (1080p)'];
export const PRODUCT_INTERACTIONS: readonly ProductInteraction[] = ['Tenir en main', 'Placer à côté', 'Regarder le produit', 'Prompt Libre'];

// --- Clothing Styles ---
export const CLOTHING_STYLES: Record<string, string[]> = {
  'Classiques et intemporels': ['Business minimaliste', 'Chic décontracté', 'Casual urbain', 'Élégance monochrome', 'Préppy moderne'],
  'Nature & bien-être': ['Linen spa', 'Organic lounge', 'Minimal outdoor', 'Sun retreat', 'Active relax'],
  'Mode urbaine / contemporaine': ['Street smart', 'Creative studio', 'Tech casual', 'Luxury street', 'Neo-retro'],
  'Luxe et élégance': ['Resort haute gamme', 'Soirée Riviera', 'Mode couture', 'Glamour discret', 'Art-fashion'],
};

// --- Loading Messages ---
export const LOADING_MESSAGES = [
  'Initialisation du moteur de rendu...',
  'Composition de la scène...',
  "Calcul de l'éclairage cinématique...",
  'Génération des images clés...',
  'Encodage final...',
  'Presque terminé, finalisation...',
];
