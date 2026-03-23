import React, { useState, useCallback } from 'react';
import type { FormState } from '../../types';
import { VoiceInput } from '../common/VoiceInput';
import { generateSceneSuggestions } from '../../services/api';

interface SceneBuilderProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const SceneBuilder: React.FC<SceneBuilderProps> = ({ formState, setFormState }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleGenerateSuggestions = useCallback(async () => {
    const productName = formState.productChoice.custom.name || 'Produit';
    const productDesc = formState.productChoice.custom.description || '';
    setIsLoadingSuggestions(true);
    try {
      const results = await generateSceneSuggestions([
        { name: productName, category: productDesc || 'marketing local' },
      ]);
      setSuggestions(results.slice(0, 4));
    } catch (e) {
      console.warn('Scene suggestions failed:', e);
      setSuggestions([
        'Scène conviviale en famille autour d\'un repas, lumière chaude du soir',
        'Ambiance marché de quartier, produits frais, couleurs vives',
        'Bureau moderne et lumineux, pause déjeuner entre collègues',
        'Terrasse de café en centre-ville, soleil de fin d\'après-midi',
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [formState.productChoice.custom.name, formState.productChoice.custom.description]);

  const selectSuggestion = (text: string) => {
    setFormState((s) => ({ ...s, customScenePrompt: text }));
  };

  return (
    <div className="card">
      <h3 className="section-title">2. Scène</h3>

      {/* Custom Scene Prompt */}
      <div className="flex gap-2 mb-3">
        <textarea
          value={formState.customScenePrompt}
          onChange={(e) => setFormState((s) => ({ ...s, customScenePrompt: e.target.value }))}
          placeholder="Décrivez la scène idéale pour votre visuel publicitaire..."
          rows={3}
          className="input-field text-sm resize-none flex-1"
        />
        <div className="flex flex-col gap-1.5">
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

      {/* AI Suggestions */}
      <button
        onClick={handleGenerateSuggestions}
        disabled={isLoadingSuggestions}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 mb-2"
      >
        {isLoadingSuggestions ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            4 propositions inspirationnelles par l'IA
          </>
        )}
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => selectSuggestion(s)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                formState.customScenePrompt === s
                  ? 'bg-purple-50 border border-purple-200 text-purple-700'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
