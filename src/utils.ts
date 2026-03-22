// ============================================================
// MEDIAPOST STUDIO ADS V2 — Utilities
// ============================================================
import type { OutputPackId, OutputSpec, Overlay } from './types';

export const getStandardFilename = (id: OutputPackId, spec: OutputSpec): string => {
  const prefixMap: Record<OutputPackId, string> = {
    SOCIAL_SQUARE: 'social-square',
    CATALOG: 'catalog',
    POST_VERTICAL: 'post-vertical',
    STORY: 'story',
    WEB_HERO: 'web-hero',
    PRINT_FLYER: 'print-flyer',
  };
  const prefix = prefixMap[id] || id.toLowerCase().replace(/_/g, '-');
  const ratio = spec.ratio.replace(':', '-');
  return `mediapost_${prefix}_${ratio}.png`;
};

export const getStandardVideoFilename = (id: OutputPackId, spec: OutputSpec): string => {
  const prefix = getStandardFilename(id, spec).replace('.png', '');
  return `${prefix}_video.mp4`;
};

export const deepCloneOverlays = (overlays: Overlay[]): Overlay[] => {
  return JSON.parse(JSON.stringify(overlays));
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
