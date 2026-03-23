// ─────────────────────────────────────────────────────────────
// OverlayPostEditor.tsx — Panneau de post-production dépliable
// Se place SOUS chaque image générée dans Gallery.tsx
// Utilise les types existants de types.ts
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import type { Overlay, LogoOverlay, TextOverlay } from '../../types';
import { BRAND, FONT_OPTIONS } from '../../constants';

interface OverlayPostEditorProps {
  overlays: Overlay[];
  onOverlaysChange: (overlays: Overlay[]) => void;
}

const uid = () => `ovl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const QUICK_COLORS = [
  '#FFFFFF', '#E9041E', '#004990', '#FFD100', '#1A1A2E', '#00C853', '#FF6D00', '#AA00FF',
];

// ─── Slider ───────────────────────────────────────────────
const Slider: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}> = ({ label, value, min, max, step, suffix, prefix, onChange }) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-0.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] text-gray-700 font-medium tabular-nums">
        {prefix}{Number.isInteger(step) ? value : value.toFixed(step < 0.1 ? 2 : 1)}{suffix}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-blue"
    />
  </div>
);

// ─── Logo Editor ──────────────────────────────────────────
const LogoEditorCard: React.FC<{
  overlay: LogoOverlay;
  onChange: (updated: LogoOverlay) => void;
  onDelete: () => void;
}> = ({ overlay, onChange, onDelete }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...overlay, url: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-gray-200/60 space-y-2.5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={overlay.url} alt="Logo" className="max-w-full max-h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span className="text-xs font-semibold text-gray-700">Logo</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => fileRef.current?.click()}
            className="px-2 py-1 text-[10px] font-medium text-brand-blue bg-brand-blue/5 rounded-md hover:bg-brand-blue/10 transition-colors">
            Changer
          </button>
          <button onClick={() => onChange({ ...overlay, url: BRAND.default_logo_url })}
            className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Défaut
          </button>
          <button onClick={onDelete}
            className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Supprimer">
            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.svg" className="hidden" onChange={handleFile} />
      </div>
      <Slider label="Taille" value={overlay.size} min={5} max={60} step={1} suffix="%" onChange={(v) => onChange({ ...overlay, size: v })} />
      <Slider label="Rotation" value={overlay.rotation} min={-180} max={180} step={1} suffix="°" onChange={(v) => onChange({ ...overlay, rotation: v })} />
    </div>
  );
};

// ─── Text Editor ──────────────────────────────────────────
const TextEditorCard: React.FC<{
  overlay: TextOverlay;
  onChange: (updated: TextOverlay) => void;
  onDelete: () => void;
}> = ({ overlay, onChange, onDelete }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-gray-200/60 space-y-2.5 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]"
          style={{ fontFamily: overlay.fontFamily }} title={overlay.text}>
          Texte: "{overlay.text.substring(0, 25)}{overlay.text.length > 25 ? '…' : ''}"
        </span>
        <button onClick={onDelete}
          className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
          title="Supprimer">
          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenu */}
      <input type="text" value={overlay.text}
        onChange={(e) => onChange({ ...overlay, text: e.target.value })}
        className="input-field text-sm py-2 w-full" placeholder="Votre texte..." />

      {/* Police + Taille */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">Police</label>
          <select value={overlay.fontFamily}
            onChange={(e) => onChange({ ...overlay, fontFamily: e.target.value })}
            className="input-field text-xs py-1.5 w-full">
            {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <Slider label="Taille Police" value={overlay.fontSize} min={1} max={15} step={0.5} suffix="%"
            onChange={(v) => onChange({ ...overlay, fontSize: v })} />
        </div>
      </div>

      {/* Couleur — palette rapide */}
      <div>
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">Couleur</label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_COLORS.map((c) => (
            <button key={c} onClick={() => onChange({ ...overlay, colorHex: c })}
              className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                overlay.colorHex.toUpperCase() === c.toUpperCase()
                  ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400 hover:scale-105'
              }`}
              style={{ backgroundColor: c }} title={c} />
          ))}
          <label className="relative w-6 h-6 flex-shrink-0" title="Custom">
            <input type="color" value={overlay.colorHex}
              onChange={(e) => onChange({ ...overlay, colorHex: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </label>
        </div>
      </div>

      {/* Ombre + Échelle */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={overlay.shadow}
            onChange={(e) => onChange({ ...overlay, shadow: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/20" />
          <span className="text-xs text-gray-600">Ombre</span>
        </label>
        <div className="flex-1">
          <Slider label="Échelle" value={overlay.scale} min={0.5} max={3} step={0.1} prefix="x"
            onChange={(v) => onChange({ ...overlay, scale: v })} />
        </div>
      </div>

      {/* Bannière */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={overlay.bannerEnabled}
            onChange={(e) => onChange({ ...overlay, bannerEnabled: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/20" />
          <span className="text-xs font-medium text-gray-700">Bannière</span>
        </label>
        {overlay.bannerEnabled && (
          <div className="pl-2 border-l-2 border-brand-red/20 space-y-1.5">
            <label className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-12">Couleur</span>
              <input type="color" value={overlay.bannerColorHex}
                onChange={(e) => onChange({ ...overlay, bannerColorHex: e.target.value })}
                className="w-7 h-5 rounded cursor-pointer border border-gray-200" />
              <span className="text-[10px] text-gray-400 font-mono">{overlay.bannerColorHex}</span>
            </label>
            <Slider label="Marge" value={overlay.bannerPadding} min={0} max={2} step={0.05} prefix="x"
              onChange={(v) => onChange({ ...overlay, bannerPadding: v })} />
            <Slider label="Arrondi" value={overlay.bannerBorderRadius} min={0} max={1} step={0.05} prefix="x"
              onChange={(v) => onChange({ ...overlay, bannerBorderRadius: v })} />
          </div>
        )}
      </div>

      {/* Toggle avancé */}
      <button onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
        <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Rotation & Distorsion
      </button>
      {showAdvanced && (
        <div className="space-y-1 pl-2 border-l-2 border-gray-200">
          <Slider label="Rotation" value={overlay.rotation} min={-180} max={180} step={1} suffix="°"
            onChange={(v) => onChange({ ...overlay, rotation: v })} />
          <Slider label="Inclinaison X" value={overlay.skewX} min={-30} max={30} step={1} suffix="°"
            onChange={(v) => onChange({ ...overlay, skewX: v })} />
          <Slider label="Inclinaison Y" value={overlay.skewY} min={-30} max={30} step={1} suffix="°"
            onChange={(v) => onChange({ ...overlay, skewY: v })} />
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────
export const OverlayPostEditor: React.FC<OverlayPostEditorProps> = ({ overlays, onOverlaysChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const logos = overlays.filter((o): o is LogoOverlay => o.type === 'logo');
  const texts = overlays.filter((o): o is TextOverlay => o.type === 'text');

  const updateOverlay = (id: string, updated: Overlay) => {
    onOverlaysChange(overlays.map((o) => (o.id === id ? updated : o)));
  };

  const deleteOverlay = (id: string) => {
    onOverlaysChange(overlays.filter((o) => o.id !== id));
  };

  const addLogo = () => {
    const newLogo: LogoOverlay = {
      id: uid(), type: 'logo', url: BRAND.default_logo_url,
      size: 20, rotation: 0, x: 50, y: 15,
    };
    onOverlaysChange([...overlays, newLogo]);
    if (!isOpen) setIsOpen(true);
  };

  const addText = () => {
    const newText: TextOverlay = {
      id: uid(), type: 'text', text: 'Votre texte ici',
      fontFamily: 'DM Sans', fontSize: 5, scale: 1, rotation: 0,
      colorHex: '#FFFFFF', shadow: true,
      bannerEnabled: true, bannerColorHex: BRAND.color_palette.primary,
      bannerPadding: 0.5, bannerBorderRadius: 0.25,
      x: 50, y: 85, skewX: 0, skewY: 0,
    };
    onOverlaysChange([...overlays, newText]);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="mt-3">
      {/* Barre de contrôle */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
            isOpen
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-sm'
          }`}>
          <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Post-prod
          {overlays.length > 0 && (
            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
              isOpen ? 'bg-white/20 text-white' : 'bg-brand-red/10 text-brand-red'
            }`}>{overlays.length}</span>
          )}
        </button>

        <button onClick={addLogo}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10 border border-brand-blue/10 transition-all">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Logo
        </button>

        <button onClick={addText}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-brand-red/5 text-brand-red hover:bg-brand-red/10 border border-brand-red/10 transition-all">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Texte
        </button>
      </div>

      {/* Panneau dépliable */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? 'max-h-[3000px] opacity-100 mt-2.5' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gradient-to-b from-gray-50/80 to-white/50 rounded-xl border border-gray-200/60 p-3 space-y-3">
          {/* Logos */}
          {logos.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-300" />Logos ({logos.length})<span className="flex-1 h-px bg-gray-200" />
              </h4>
              <div className="space-y-2">
                {logos.map((logo) => (
                  <LogoEditorCard key={logo.id} overlay={logo}
                    onChange={(u) => updateOverlay(logo.id, u)}
                    onDelete={() => deleteOverlay(logo.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Textes */}
          {texts.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-300" />Textes ({texts.length})<span className="flex-1 h-px bg-gray-200" />
              </h4>
              <div className="space-y-2">
                {texts.map((txt) => (
                  <TextEditorCard key={txt.id} overlay={txt}
                    onChange={(u) => updateOverlay(txt.id, u)}
                    onDelete={() => deleteOverlay(txt.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {overlays.length === 0 && (
            <div className="text-center py-5">
              <p className="text-xs text-gray-400">Ajoutez un logo ou un texte pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
