import React, { useRef } from 'react';
import type { Overlay, LogoOverlay, TextOverlay } from '../../types';
import { BRAND, FONT_OPTIONS } from '../../constants';

interface OverlayEditorProps {
  overlays: Overlay[];
  onChange: (overlays: Overlay[]) => void;
  onApplyGlobal?: () => void;
  showApplyGlobal?: boolean;
}

const uid = () => `overlay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

export const OverlayEditor: React.FC<OverlayEditorProps> = ({
  overlays,
  onChange,
  onApplyGlobal,
  showApplyGlobal = false,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const updateOverlay = (id: string, patch: Partial<Overlay>) => {
    onChange(overlays.map((o) => (o.id === id ? { ...o, ...patch } as Overlay : o)));
  };

  const removeOverlay = (id: string) => {
    onChange(overlays.filter((o) => o.id !== id));
  };

  const addLogo = () => {
    onChange([
      ...overlays,
      {
        id: uid(),
        type: 'logo',
        url: BRAND.default_logo_url,
        size: 20,
        rotation: 0,
        x: 50,
        y: 15,
      } as LogoOverlay,
    ]);
  };

  const addText = () => {
    onChange([
      ...overlays,
      {
        id: uid(),
        type: 'text',
        text: 'Votre texte ici',
        fontFamily: 'DM Sans',
        fontSize: 5,
        scale: 1,
        rotation: 0,
        colorHex: '#FFFFFF',
        shadow: true,
        bannerEnabled: true,
        bannerColorHex: BRAND.color_palette.primary,
        bannerPadding: 0.5,
        bannerBorderRadius: 0.25,
        x: 50,
        y: 85,
        skewX: 0,
        skewY: 0,
      } as TextOverlay,
    ]);
  };

  const handleLogoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateOverlay(id, { url: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const resetLogoToDefault = (id: string) => {
    updateOverlay(id, { url: BRAND.default_logo_url });
  };

  return (
    <div className="card">
      <h3 className="section-title">4. Gabarit global</h3>

      <div className="space-y-4">
        {overlays.map((overlay) => {
          if (overlay.type === 'logo') {
            const logo = overlay as LogoOverlay;
            return (
              <div key={logo.id} className="bg-gray-50 rounded-xl p-4 relative">
                <button onClick={() => removeOverlay(logo.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-2 mb-3">
                  {logo.url && <img src={logo.url} alt="Logo" className="h-6 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  <span className="text-xs font-semibold text-gray-700">Logo</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <label className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-medium text-gray-600 text-center cursor-pointer hover:bg-gray-100 border border-gray-200 transition-colors">
                    Changer...
                    <input type="file" accept="image/*,.svg" onChange={(e) => handleLogoUpload(logo.id, e)} className="hidden" />
                  </label>
                  <button onClick={() => resetLogoToDefault(logo.id)} className="px-3 py-2 bg-white rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                    Défaut
                  </button>
                </div>
                <Slider label="Taille" value={logo.size} min={5} max={50} step={1} suffix="%" onChange={(v) => updateOverlay(logo.id, { size: v })} />
                <Slider label="Rotation" value={logo.rotation} min={-180} max={180} step={1} suffix="°" onChange={(v) => updateOverlay(logo.id, { rotation: v })} />
              </div>
            );
          }

          if (overlay.type === 'text') {
            const txt = overlay as TextOverlay;
            return (
              <div key={txt.id} className="bg-gray-50 rounded-xl p-4 relative">
                <button onClick={() => removeOverlay(txt.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <span className="text-xs font-semibold text-gray-700 mb-3 block">Texte</span>

                {/* Text + AI Slogans button */}
                <div className="flex gap-1.5 mb-3">
                  <input
                    type="text"
                    value={txt.text}
                    onChange={(e) => updateOverlay(txt.id, { text: e.target.value })}
                    className="input-field text-sm flex-1 py-2"
                    placeholder="Texte de l'overlay"
                  />
                </div>

                {/* Font selector */}
                <select
                  value={txt.fontFamily}
                  onChange={(e) => updateOverlay(txt.id, { fontFamily: e.target.value })}
                  className="input-field text-xs py-1.5 mb-3"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>

                {/* Color + Shadow */}
                <div className="flex gap-3 mb-3">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="color"
                      value={txt.colorHex}
                      onChange={(e) => updateOverlay(txt.id, { colorHex: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">Couleur</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={txt.shadow}
                      onChange={(e) => updateOverlay(txt.id, { shadow: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/20"
                    />
                    <span className="text-xs text-gray-600">Ombre</span>
                  </label>
                </div>

                <Slider label="Taille Police" value={txt.fontSize} min={1} max={15} step={0.5} suffix="%" onChange={(v) => updateOverlay(txt.id, { fontSize: v })} />
                <Slider label="Échelle" value={txt.scale} min={0.5} max={3} step={0.1} prefix="x" onChange={(v) => updateOverlay(txt.id, { scale: v })} />
                <Slider label="Rotation" value={txt.rotation} min={-180} max={180} step={1} suffix="°" onChange={(v) => updateOverlay(txt.id, { rotation: v })} />

                {/* Distorsion & Perspective */}
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-2">Distorsion & Perspective</p>
                <Slider label="Inclinaison Horizontale (X)" value={txt.skewX} min={-30} max={30} step={1} suffix="°" onChange={(v) => updateOverlay(txt.id, { skewX: v })} />
                <Slider label="Inclinaison Verticale (Y)" value={txt.skewY} min={-30} max={30} step={1} suffix="°" onChange={(v) => updateOverlay(txt.id, { skewY: v })} />

                {/* Banner */}
                <label className="flex items-center gap-2 mt-3 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={txt.bannerEnabled}
                    onChange={(e) => updateOverlay(txt.id, { bannerEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/20"
                  />
                  <span className="text-xs font-medium text-gray-700">Bannière</span>
                </label>
                {txt.bannerEnabled && (
                  <div className="pl-2 border-l-2 border-gray-200 ml-1">
                    <label className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">Couleur:</span>
                      <input
                        type="color"
                        value={txt.bannerColorHex}
                        onChange={(e) => updateOverlay(txt.id, { bannerColorHex: e.target.value })}
                        className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                      />
                    </label>
                    <Slider label="Marge Bannière" value={txt.bannerPadding} min={0} max={2} step={0.05} prefix="x" onChange={(v) => updateOverlay(txt.id, { bannerPadding: v })} />
                    <Slider label="Arrondi Bannière" value={txt.bannerBorderRadius} min={0} max={1} step={0.05} prefix="x" onChange={(v) => updateOverlay(txt.id, { bannerBorderRadius: v })} />
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Add buttons */}
      <div className="flex gap-2 mt-4">
        <button onClick={addLogo} className="flex-1 py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          + Ajouter un logo
        </button>
        <button onClick={addText} className="flex-1 py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          + Ajouter un texte
        </button>
      </div>

      {/* Apply to all images */}
      {showApplyGlobal && onApplyGlobal && (
        <button
          onClick={onApplyGlobal}
          className="w-full mt-3 py-2.5 px-3 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          Appliquer le gabarit à toutes les images
        </button>
      )}
    </div>
  );
};

// --- Slider sub-component ---
const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, suffix, prefix, onChange }) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-0.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] text-gray-700 font-medium tabular-nums">
        {prefix}{typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(step < 0.1 ? 2 : 1)) : value}{suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-blue"
    />
  </div>
);
