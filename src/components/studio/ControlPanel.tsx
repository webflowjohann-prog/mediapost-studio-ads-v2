import React from 'react';
import type { FormState } from '../../types';
import { ProductSelector } from './ProductSelector';
import { StyleSelector } from './StyleSelector';
import { ContextSelector } from './ContextSelector';
import { OutputSelector } from './OutputSelector';
import { VoiceInput } from '../common/VoiceInput';

interface ControlPanelProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  formState,
  setFormState,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="space-y-4 sticky top-16">
      <ProductSelector formState={formState} setFormState={setFormState} />

      <StyleSelector
        value={formState.stylePreset}
        onChange={(v) => setFormState((s) => ({ ...s, stylePreset: v }))}
      />

      <ContextSelector
        value={formState.contextMode}
        onChange={(v) => setFormState((s) => ({ ...s, contextMode: v }))}
      />

      {/* Custom Scene Prompt */}
      <div className="card">
        <h3 className="section-title">Scène personnalisée</h3>
        <div className="flex gap-2">
          <textarea
            value={formState.customScenePrompt}
            onChange={(e) =>
              setFormState((s) => ({ ...s, customScenePrompt: e.target.value }))
            }
            placeholder="Décrivez la scène idéale..."
            rows={3}
            className="input-field text-sm resize-none flex-1"
          />
          <VoiceInput
            onTranscript={(t) =>
              setFormState((s) => ({
                ...s,
                customScenePrompt: (s.customScenePrompt + ' ' + t).trim(),
              }))
            }
          />
        </div>
      </div>

      <OutputSelector
        value={formState.outputPack}
        onChange={(v) => setFormState((s) => ({ ...s, outputPack: v }))}
      />

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading || formState.productChoice.preset_product_ids.length === 0}
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
