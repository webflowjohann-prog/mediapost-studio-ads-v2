// ─────────────────────────────────────────────────────────────
// compositeImage.ts — Fusionne image + overlays en un seul PNG
// Utilise Canvas 2D pour "graver" logo et texte sur l'image
// Gère les logos SVG externes et les problèmes CORS
// ─────────────────────────────────────────────────────────────
import type { Overlay, LogoOverlay, TextOverlay } from '../types';

/**
 * Charge une image en contournant les problèmes CORS.
 * Pour les URLs externes (http/https), on fetch d'abord en blob
 * puis on crée un object URL local — pas de CORS sur le canvas.
 * Pour les data: URLs et blob: URLs, on charge directement.
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  let safeSrc = src;

  // Si c'est une URL externe, on la convertit en blob URL local
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();

      // Si c'est un SVG, on le convertit en PNG via un canvas intermédiaire
      if (blob.type === 'image/svg+xml' || src.endsWith('.svg')) {
        return await svgBlobToImage(blob);
      }

      safeSrc = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('[composite] Fetch failed for', src.substring(0, 60), '- trying direct load');
      // Fallback: essayer le chargement direct
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src.substring(0, 60)}`));
    img.src = safeSrc;
  });
}

/**
 * Convertit un blob SVG en HTMLImageElement PNG via un canvas intermédiaire.
 * Les SVG n'ont pas de dimensions intrinsèques fiables dans un canvas,
 * donc on les rasterise d'abord à une taille fixe.
 */
async function svgBlobToImage(blob: Blob): Promise<HTMLImageElement> {
  const svgText = await blob.text();

  // Extraire les dimensions du SVG si possible
  let svgW = 400, svgH = 120;
  const widthMatch = svgText.match(/width="([^"]+)"/);
  const heightMatch = svgText.match(/height="([^"]+)"/);
  const vbMatch = svgText.match(/viewBox="([^"]+)"/);

  if (widthMatch && heightMatch) {
    svgW = parseFloat(widthMatch[1]) || svgW;
    svgH = parseFloat(heightMatch[1]) || svgH;
  } else if (vbMatch) {
    const parts = vbMatch[1].split(/[\s,]+/).map(Number);
    if (parts.length >= 4) {
      svgW = parts[2] || svgW;
      svgH = parts[3] || svgH;
    }
  }

  // Rasteriser à haute résolution
  const scale = 3;
  const canvas = document.createElement('canvas');
  canvas.width = svgW * scale;
  canvas.height = svgH * scale;
  const ctx = canvas.getContext('2d')!;

  // Créer une image depuis le SVG inline en data URL
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

  const svgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG rasterization failed'));
    img.src = svgDataUrl;
  });

  ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);

  // Convertir le canvas en image
  const pngDataUrl = canvas.toDataURL('image/png');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('PNG from SVG failed'));
    img.src = pngDataUrl;
  });
}

/**
 * Composite : dessine l'image de base + tous les overlays sur un Canvas,
 * puis retourne un blob URL téléchargeable.
 */
export async function compositeImageWithOverlays(
  imageUrl: string,
  overlays: Overlay[],
): Promise<string> {
  const baseImg = await loadImage(imageUrl);
  const W = baseImg.naturalWidth;
  const H = baseImg.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(baseImg, 0, 0, W, H);

  // Dessiner chaque overlay
  for (const overlay of overlays) {
    try {
      if (overlay.type === 'logo') {
        await drawLogoOverlay(ctx, overlay as LogoOverlay, W, H);
      } else if (overlay.type === 'text') {
        drawTextOverlay(ctx, overlay as TextOverlay, W, H);
      }
    } catch (e) {
      console.warn('[composite] Overlay failed:', overlay.type, e);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas export failed'));
        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1.0,
    );
  });
}

/**
 * Dessine un logo sur le canvas
 */
async function drawLogoOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: LogoOverlay,
  W: number,
  H: number,
) {
  const logoImg = await loadImage(overlay.url);

  const cx = (overlay.x / 100) * W;
  const cy = (overlay.y / 100) * H;

  const logoW = (overlay.size / 100) * W;
  const logoH = logoW * (logoImg.naturalHeight / logoImg.naturalWidth);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((overlay.rotation * Math.PI) / 180);
  ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
  ctx.restore();
}

/**
 * Dessine un texte sur le canvas
 */
function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlay,
  W: number,
  H: number,
) {
  const cx = (overlay.x / 100) * W;
  const cy = (overlay.y / 100) * H;

  const fontSizePx = (overlay.fontSize / 100) * W;
  const scaledFontSize = fontSizePx * overlay.scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((overlay.rotation * Math.PI) / 180);

  if (overlay.skewX !== 0 || overlay.skewY !== 0) {
    const skewXRad = (overlay.skewX * Math.PI) / 180;
    const skewYRad = (overlay.skewY * Math.PI) / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
  }

  ctx.font = `${scaledFontSize}px "${overlay.fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textMetrics = ctx.measureText(overlay.text);
  const textWidth = textMetrics.width;

  // Bannière
  if (overlay.bannerEnabled) {
    const padX = overlay.bannerPadding * scaledFontSize;
    const padY = overlay.bannerPadding * 0.5 * scaledFontSize;
    const borderRadius = overlay.bannerBorderRadius * scaledFontSize;
    const bx = -textWidth / 2 - padX;
    const by = -scaledFontSize / 2 - padY;
    const bw = textWidth + padX * 2;
    const bh = scaledFontSize + padY * 2;

    ctx.fillStyle = overlay.bannerColorHex;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, borderRadius);
    ctx.fill();
  }

  // Ombre
  if (overlay.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4 * (scaledFontSize / 20);
    ctx.shadowOffsetX = 2 * (scaledFontSize / 20);
    ctx.shadowOffsetY = 2 * (scaledFontSize / 20);
  }

  ctx.fillStyle = overlay.colorHex;
  ctx.fillText(overlay.text, 0, 0);

  ctx.restore();
}
