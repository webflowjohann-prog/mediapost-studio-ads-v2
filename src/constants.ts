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
  default_logo_url: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEyNTQgMTAwIiB3aWR0aD0iMTI1NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtODYxLjQzMiAyLjIyNjMzdjE4LjQ0NjQ3aDM2LjQ3MXY3Ny4yMDhoMjAuMjE3di03Ny4yMDhoMzYuNDc4di0xOC40NDY0N3ptMTA5Ljk3MSAwdjg4LjgyNjI3YzAgMy45NTgxIDIuNDU3IDYuODI4MiA2Ljk2NyA2LjgyODJoMzEuNmwyOS4xMi0xOC40NDY0aC00Ny40Njh2LTIxLjE4NTdoNTcuNjQ4di0xOC40NDY1aC01Ny42NDh2LTE5LjEzMTJoNjIuODM4di0xOC40NDY0OHptLTQwNi45MTcgNDguNzgzNjdjLTQuMjM2IDAtMTAuMzY4LS4xMzgxLTE1LjI4LS4xMzgxdi0zMC42MTE1YzQuOTE0LS4xMzYyIDEwLjI0MS0uMTM2MiAxNC40NzctLjEzNjIgMTUuNzEzIDAgMjQuMTguNTQ4NiAyOS43ODMgNi4xNTQzIDEuOTEyIDEuOTEyNyAzLjI4IDUuNDY0IDMuMjggOC42MDgzIDAgNC41MDY3LTEuMzQ4IDcuNjcxLTMuOTYyIDEwLjM4NjctNS41MjIgNS43MzY1LTE2Ljg5MSA1LjczNjUtMjguMjk4IDUuNzM2NXptLTM1LjQ5Ny00OC43ODM2N3Y5NS42NTQ0N2gyMC4yMjF2LTI4LjU1ODhjNC45MTMgMCAxMS40NzIuMTM4IDE1LjcwOC4xMzggMzAuNDYgMCA1Mi43MzEtNy41MTg0IDUyLjczMS0zNC40MzcgMC0yNC4wNTAzLTE4LjcxNy0zMy40ODE0OC01NC4wOTgtMzMuNDgxNDgtMTEuNDc4LS4wMDE4Mi0yNC40NTQuNDEwNTItMzQuNTYyLjY4NDgxem0xMjIuNzk0IDQ3LjgyODE3YzAtMTkuMTMxMyAxNS4yOTYtMzEuNTY4OCAzNi44ODEtMzEuNTY4OCAyMS40NDggMCAzNi43NDggMTIuNDM3NSAzNi43NDggMzEuNTY4OCAwIDE5LjEzMTItMTUuMyAzMS41Njg3LTM2Ljc0OCAzMS41Njg3LTIxLjU4NSAwLTM2Ljg4MS0xMi40Mzc1LTM2Ljg4MS0zMS41Njg3em0tMjAuOTA0IDBjMCAyNy40NjUzIDIxLjU4MSA0OS43NDQ1IDU3Ljc4NSA0OS43NDQ1IDM2LjIgMCA1Ny43OC0yMi4yNzkyIDU3Ljc4LTQ5Ljc0NDUgMC0yNy40NjktMjEuNTgtNDkuNzQ0NTYzLTU3Ljc4LTQ5Ljc0NDU2My0zNi4yMDIgMC01Ny43ODUgMjIuMjc1NTYzLTU3Ljc4NSA0OS43NDQ1NjN6bTEzMi40NjItMTkuMTMzMWMwIDMzLjQ3NzkgNjQuNzUxIDIxLjg2MzMgNjQuNzUxIDQwLjk5NjMgMCA3LjkyNTQtMTEuNjEgMTAuNzk1NC0yMS40NDggMTAuNzk1NC0xMy4zODQgMC0yOC42ODQtNC42NDQ3LTM4LjExMi0xMi4wMjUxbC0xMC4zODMgMTUuNDQzOGMxMi43MDcgOC43NDQ1IDMyLjM3NiAxMy42NjcyIDQ2LjcyMSAxMy42NjcyIDI0LjE3OSAwIDQ0LjI2LTExLjIwNTkgNDQuMjYtMzAuMDY4MyAwLTM0LjAyNjUtNjQuODg5LTI0LjE4NDctNjQuODg5LTQxLjgxMzggMC02Ljk2OTggOS4xNTctMTAuNTI0NyAyMS44NjQtMTAuNTI0NyA5LjY5OCAwIDIzLjQ4OSAzLjY4NzUgMzEuNTUzIDkuODQxN2wxMC4zNzktMTUuNDQzOGMtMTAuMzc5LTYuOTY5ODItMjguMjc3LTExLjQ4MDE2My00MS41MjQtMTEuNDgwMTYzLTI0LjMxNyAwLTQzLjE3MiAxMi44NDgwNjMtNDMuMTcyIDMwLjYxMTQ2M3oiIGZpbGw9IiMwMDNkYTUiLz48cGF0aCBkPSJtMTA4Ny40NyA0Ljg4MjAzIDQ2Ljg0IDIxLjMwMDE3aDcxLjc0bDUuOTQtMTAuMzA4NmMzLjU2LTYuMTc5NjktLjc0LTEzLjYwMDA0LTcuMjQtMTMuNjAwMDRoLTExNi43N2MtMS41OSAwLTEuOTcgMS45NDE4Mi0uNTEgMi42MDg0N3oiIGZpbGw9IiMwMDNkYTUiLz48cGF0aCBkPSJtMTEzNC4zMSAzNS4zMjY0aDExNi44NmMxLjM1IDAgMi42NiAxLjA1OSAyLjY2IDIuNjM5MyAwIDEuMzk2OS0uOTYgMi4zMDctMS45MiAyLjU3NGwtMjExLjQ0IDU3LjI3NzVjLTEuMzguMzc3OC0yLjM1LTEuNDAwNS0xLjE5LTIuMzI1MXoiIGZpbGw9IiMwMDNkYTUiLz48cGF0aCBkPSJtMTA3NS4yNyA5Ny44NjgxIDc2LjcxLTEuNDI3OGM3LjQ0LS4xMzggMTYuMTYtNC40Mjg2IDIwLjE0LTExLjMzM2w5LjE5LTE1Ljk3MjR6IiBmaWxsPSIjMDAzZGE1Ii8+PGcgZmlsbD0iI2YxMjUzNSI+PHBhdGggZD0ibTM2Mi44NjYgOTcuODgwOHYtOTUuNjY5MDFoMjAuMjE5djk1LjY2OTAxeiIvPjxwYXRoIGQ9Im01NS4zNzkgOTEuMzM0Mi0zNS41NDYyLTYyLjIxNDh2NzAuMDQwMmgtMTkuNjcwNjkxdi05Ni45Mjk2NWgyNC42NTMxOTFsMzYuMjU5OSA2My4zMzczNSAzNi4yNjE3LTYzLjMzNzM1aDI0LjY0OTF2OTYuOTI5NjVoLTIwLjIxN3YtNzAuMDQwMmwtMzUuNDA5OCA2Mi4yMTQ4eiIvPjxwYXRoIGQ9Im0yMTguOTkyIDc5LjA1ODNoLTkuMzZjLTUuNTU3IDAtMTAuMDYyIDQuNTA2OC0xMC4wNjIgMTAuMDY1MiAwIDUuNTU4NSA0LjUwNSAxMC4wNjUyIDEwLjA2MiAxMC4wNjUyaDkuMzZjNS41NTcgMCAxMC4wNjItNC41MDY3IDEwLjA2Mi0xMC4wNjUyIDAtNS41NTg0LTQuNTA1LTEwLjA2NTItMTAuMDYyLTEwLjA2NTJ6Ii8+PHBhdGggZD0ibTE4Ni42NDIgMjIuMTQ0MWgzMi4zNWM1LjU1NyAwIDEwLjA2Mi00LjUwNjcgMTAuMDYyLTEwLjA2NTEgMC01LjU1ODUtNC41MDUtMTAuMDY1MjEtMTAuMDYyLTEwLjA2NTIxaC0zMi4zNWMtNS41NTYgMC0xMC4wNjEgNC41MDY3MS0xMC4wNjEgMTAuMDY1MjEgMCA1LjU1ODQgNC41MDUgMTAuMDY1MSAxMC4wNjEgMTAuMDY1MXoiLz48cGF0aCBkPSJtMTQ2LjQ5MyAyMi4xNDQxaDguNjc1YzUuNTU3IDAgMTAuMDYyLTQuNTA2NyAxMC4wNjItMTAuMDY1MSAwLTUuNTU4NS00LjUwNS0xMC4wNjUyMS0xMC4wNjItMTAuMDY1MjFoLTguNjc1Yy01LjU1NyAwLTEwLjA2MiA0LjUwNjcxLTEwLjA2MiAxMC4wNjUyMSAwIDUuNTU4NCA0LjUwNSAxMC4wNjUxIDEwLjA2MiAxMC4wNjUxeiIvPjxwYXRoIGQ9Im0yMTguOTkyIDQwLjJoLTU0LjEyNWMtLjA4MiAwLS4xNTguMDIxOC0uMjQuMDIzNi0xNi4xMzMuMTMwOC0yOS4yMjIgMTMuMjkxMy0yOS4yMjIgMjkuNDU5OCAwIDE2LjA0MTUgMTIuODg1IDI5LjEwNTYgMjguODQxIDI5LjQzOTkuMjA5LjAxMjcuNDA4LjA2MTcuNjIxLjA2MTdoMTQuNjQxYzUuNTU2IDAgMTAuMDYxLTQuNTA2NyAxMC4wNjEtMTAuMDY1MSAwLTUuNTU4NS00LjUwNS0xMC4wNjUyLTEwLjA2MS0xMC4wNjUyaC0xNC4zMzNjLS4xMDUtLjAwMzYtLjIwMy0uMDMwOS0uMzA4LS4wMzA5LTUuMTUgMC05LjMzOS00LjE5MDYtOS4zMzktOS4zNDIyIDAtNS4xNTE1IDQuMTg5LTkuMzQyMiA5LjMzOS05LjM0MjIuMDQyIDAgLjA3OC0uMDEwOS4xMi0uMDEyN2g1NC4wMDVjNS41NTcgMCAxMC4wNjItNC41MDY3IDEwLjA2Mi0xMC4wNjUyIDAtNS41NTg0LTQuNTAzLTEwLjA2MTUtMTAuMDYyLTEwLjA2MTV6Ii8+PHBhdGggZD0ibTUxNi43MDEgOTcuODgwOGgtMTIuMDIyYy03LjQ3OCAwLTkuOTY3LS4yMDE2LTEyLjk3OS02LjE0ODhsLTUuNzM4LTExLjIwNzdoLTU4Ljc0NWwtOC43NDQgMTcuMzU2NWgtMjEuNzIybDUwLjEzOC05Ni42MjQ0OGgxOS42NzJ6bS0zOS44OTEtMzUuMzk2MS0yMC4yMTktNDAuMTgwNy0yMC4yMTkgNDAuMTgwN3oiLz48cGF0aCBkPSJtMzQ1Ljc4OSA1MC4wNDcyYzAgMTYuODEzNC03LjU2NSAyNy4zODM2LTEyLjE1OSAzMS45NzkzLTMuMTQzIDMuMTQ0My0xMi42NCAxMy4yNzQ5LTM0Ljg0IDE1LjcxODEtNC44My41MzIyLTEwLjEwOS44MTkyLTE1Ljg0Ny44MTkyLTYuMzc3IDAtMTIuOTM0LS4wNjcyLTE5LjY3Mi0uMjA1My02Ljc0Mi0uMTM2Mi0xMy42NjItLjI5NjEtMjAuNzY2LS40Nzc3di05NS42NjkwMmM3LjEwNi0uMTgxNjUgMTQuMDI0LS4zNDE1IDIwLjc2Ni0uNDc3NzQgNi43NC0uMTM2MjQgMTMuMjk3LS4yMDUyNiAxOS42NzItLjIwNTI2IDUuNzM4IDAgMTEuMDE5LjI4MTU2IDE1Ljg0Ny44MTkyNCAyMS42MDEgMi40MDY4NSAzMS43NDIgMTIuNjE5MTggMzQuODQgMTUuNzE4MDggNC4xOTggNC4xOTk3IDEyLjE1OSAxNC43MjA4IDEyLjE1OSAzMS45ODExem0tMjEuMDQtLjA2OWMwLTguNTg0OC0yLjY4OC0xNS41NjkyLTguMDYyLTIwLjk1NjktMi4xODctMi4xOTA2LTcuOTY1LTguMDk0Mi0yNC4wNDUtOC44MzcyLTMuMTg5LS4xNDcxLTE2LjMzNC0uMzQ4Ny0yOS45MTktLjA2NzJ2NTkuNzI0M2MxOC4wMzguNTAxNCAyNi43My4yMjM1IDI5LjkxOS4wNjkxIDE1LjU3Ni0uNzU1NyAyMS43OC02LjY1MzggMjQuMDQ1LTguOTczNSA1LjM3NC01LjM4NzcgOC4wNjItMTIuMzczOSA4LjA2Mi0yMC45NTg2eiIvPjwvZz48L3N2Zz4=',
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
