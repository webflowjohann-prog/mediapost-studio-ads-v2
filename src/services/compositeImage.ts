import type { Overlay, LogoOverlay, TextOverlay } from '../types';

function loadImg(src: string, useCors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src.substring(0, 50)}`));
    img.src = src;
  });
}

async function rasterizeSvg(svgDataUrl: string): Promise<HTMLImageElement> {
  let svgText = '';
  if (svgDataUrl.includes(';base64,')) {
    svgText = atob(svgDataUrl.split(';base64,')[1]);
  } else if (svgDataUrl.includes(',')) {
    svgText = decodeURIComponent(svgDataUrl.split(',')[1]);
  }
  let w = 800, h = 200;
  const vb = svgText.match(/viewBox=["']([^"']+)["']/);
  if (vb) {
    const p = vb[1].split(/[\s,]+/).map(Number);
    if (p.length >= 4 && p[2] > 0 && p[3] > 0) { w = p[2]; h = p[3]; }
  }
  const scale = 3;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const ctx = c.getContext('2d')!;
  const svgImg = await loadImg(svgDataUrl, false);
  ctx.drawImage(svgImg, 0, 0, c.width, c.height);
  return loadImg(c.toDataURL('image/png'), false);
}

async function loadImageSafe(src: string): Promise<HTMLImageElement> {
  const isSvg = src.includes('image/svg') || src.endsWith('.svg');
  if (isSvg && src.startsWith('data:')) return rasterizeSvg(src);
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      if (blob.type === 'image/svg+xml' || src.endsWith('.svg')) {
        const text = await blob.text();
        return rasterizeSvg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`);
      }
      return loadImg(URL.createObjectURL(blob), false);
    } catch (e) { console.warn('[composite] fetch failed', src.substring(0, 50)); }
  }
  return loadImg(src, false);
}

export async function compositeImageWithOverlays(
  imageUrl: string, overlays: Overlay[]
): Promise<string> {
  const baseImg = await loadImageSafe(imageUrl);
  const W = baseImg.naturalWidth, H = baseImg.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(baseImg, 0, 0, W, H);
  for (const ov of overlays) {
    try {
      if (ov.type === 'logo') await drawLogo(ctx, ov as LogoOverlay, W, H);
      else if (ov.type === 'text') drawText(ctx, ov as TextOverlay, W, H);
    } catch (e) { console.warn('[composite] overlay failed', ov.type, e); }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(URL.createObjectURL(b)) : reject(new Error('export failed')), 'image/png', 1.0);
  });
}

async function drawLogo(ctx: CanvasRenderingContext2D, ov: LogoOverlay, W: number, H: number) {
  const img = await loadImageSafe(ov.url);
  const cx = (ov.x / 100) * W, cy = (ov.y / 100) * H;
  const lw = (ov.size / 100) * W, lh = lw * (img.naturalHeight / img.naturalWidth);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((ov.rotation * Math.PI) / 180);
  ctx.drawImage(img, -lw / 2, -lh / 2, lw, lh);
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, ov: TextOverlay, W: number, H: number) {
  const cx = (ov.x / 100) * W, cy = (ov.y / 100) * H;
  const fs = (ov.fontSize / 100) * W * ov.scale;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((ov.rotation * Math.PI) / 180);
  if (ov.skewX || ov.skewY) ctx.transform(1, Math.tan(ov.skewY*Math.PI/180), Math.tan(ov.skewX*Math.PI/180), 1, 0, 0);
  ctx.font = `${fs}px "${ov.fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(ov.text).width;
  if (ov.bannerEnabled) {
    const px = ov.bannerPadding * fs, py = ov.bannerPadding * 0.5 * fs;
    const br = ov.bannerBorderRadius * fs;
    ctx.fillStyle = ov.bannerColorHex;
    ctx.beginPath();
    ctx.roundRect(-tw/2-px, -fs/2-py, tw+px*2, fs+py*2, br);
    ctx.fill();
  }
  if (ov.shadow) {
    const s = fs / 20;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4*s; ctx.shadowOffsetX = 2*s; ctx.shadowOffsetY = 2*s;
  }
  ctx.fillStyle = ov.colorHex;
  ctx.fillText(ov.text, 0, 0);
  ctx.restore();
}
