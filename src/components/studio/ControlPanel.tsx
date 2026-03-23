import React from 'react';
import type { FormState } from '../../types';
import { ProductUpload } from './ProductUpload';
import { SceneBuilder } from './SceneBuilder';
import { OutputSelector } from './OutputSelector';
import { OverlayEditor } from './OverlayEditor';

interface ControlPanelProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onGenerate: () => void;
  isLoading: boolean;
  hasImages: boolean;
  onApplyGlobalOverlays: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  formState,
  setFormState,
  onGenerate,
  isLoading,
  hasImages,
  onApplyGlobalOverlays,
}) => {
  const canGenerate =
    formState.productChoice.custom.name.trim().length > 0 ||
    formState.productChoice.custom.image_url.length > 0;

  return (
    <div className="space-y-4 sticky top-16">
      {/* 1. Product */}
      <ProductUpload formState={formState} setFormState={setFormState} />

      {/* 2. Scene */}
      <SceneBuilder formState={formState} setFormState={setFormState} />

      {/* 3. Output Formats */}
      <OutputSelector
        value={formState.outputPack}
        onChange={(v) => setFormState((s) => ({ ...s, outputPack: v }))}
      />

      {/* 4. Overlay / Gabarit */}
      <OverlayEditor
        overlays={formState.overlays}
        onChange={(overlays) => setFormState((s) => ({ ...s, overlays }))}
        onApplyGlobal={onApplyGlobalOverlays}
        showApplyGlobal={hasImages}
      />

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading || !canGenerate}
        className="btn-primary w-full py-4 text-base"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération en cours...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Générer les visuels
          </>
        )}
      </button>
    </div>
  );
};
