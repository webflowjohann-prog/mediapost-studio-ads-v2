// ─────────────────────────────────────────────────────────────
// compositeImage.ts — Fusionne image + overlays en un seul PNG
// Utilise Canvas 2D pour "graver" logo et texte sur l'image
// ─────────────────────────────────────────────────────────────
import type { Overlay, LogoOverlay, TextOverlay } from '../types';

/**
 * Charge une image depuis une URL (base64 ou http)
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 60)}...`));
    img.src = src;
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
  // Charger l'image de base
  const baseImg = await loadImage(imageUrl);
  const W = baseImg.naturalWidth;
  const H = baseImg.naturalHeight;

  // Créer le canvas à la résolution native de l'image
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Dessiner l'image de fond
  ctx.drawImage(baseImg, 0, 0, W, H);

  // Dessiner chaque overlay
  for (const overlay of overlays) {
    if (overlay.type === 'logo') {
      await drawLogoOverlay(ctx, overlay as LogoOverlay, W, H);
    } else if (overlay.type === 'text') {
      drawTextOverlay(ctx, overlay as TextOverlay, W, H);
    }
  }

  // Exporter en PNG blob URL
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
  try {
    const logoImg = await loadImage(overlay.url);

    // Position en pixels (x/y sont en pourcentage 0-100)
    const cx = (overlay.x / 100) * W;
    const cy = (overlay.y / 100) * H;

    // Taille du logo : overlay.size est un % de la largeur du conteneur
    const logoW = (overlay.size / 100) * W;
    const logoH = logoW * (logoImg.naturalHeight / logoImg.naturalWidth);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
    ctx.restore();
  } catch (e) {
    console.warn('[composite] Logo load failed:', e);
  }
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

  // fontSize en cqi = % of container inline size (width)
  // On convertit : fontSize "5" en cqi → 5% de W en pixels
  const fontSizePx = (overlay.fontSize / 100) * W;
  const scaledFontSize = fontSizePx * overlay.scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((overlay.rotation * Math.PI) / 180);

  // Appliquer skew via setTransform n'est pas trivial,
  // on utilise une approximation avec transform matrix
  if (overlay.skewX !== 0 || overlay.skewY !== 0) {
    const skewXRad = (overlay.skewX * Math.PI) / 180;
    const skewYRad = (overlay.skewY * Math.PI) / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
  }

  // Configurer la police
  ctx.font = `${scaledFontSize}px "${overlay.fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textMetrics = ctx.measureText(overlay.text);
  const textWidth = textMetrics.width;

  // Bannière (fond derrière le texte)
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

  // Texte
  ctx.fillStyle = overlay.colorHex;
  ctx.fillText(overlay.text, 0, 0);

  ctx.restore();
}
