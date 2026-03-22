import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { ControlPanel } from './ControlPanel';
import { Gallery } from './Gallery';
import { generateImage, buildImagePrompt } from '../../services/api';
import type { FormState, GeneratedImage } from '../../types';
import { BRAND, OUTPUT_SPECS, OUTPUT_PACK_LABELS } from '../../constants';
import { deepCloneOverlays } from '../../utils';

const defaultOverlays = [
  {
    id: 'default-logo-1',
    type: 'logo' as const,
    url: BRAND.default_logo_url,
    size: 20,
    rotation: 0,
    x: 50,
    y: 15,
  },
  {
    id: 'default-text-1',
    type: 'text' as const,
    text: BRAND.tagline,
    fontFamily: 'DM Sans',
    fontSize: 5,
    scale: 1,
    rotation: 0,
    colorHex: '#FFFFFF',
    shadow: true,
    bannerEnabled: true,
    bannerColorHex: '#E9041E',
    bannerPadding: 0.5,
    bannerBorderRadius: 0.25,
    x: 50,
    y: 90,
    skewX: 0,
    skewY: 0,
  },
];

export interface QuickAdsStudioProps {
  onBack: () => void;
}

export const QuickAdsStudio: React.FC<QuickAdsStudioProps> = ({ onBack }) => {
  const [formState, setFormState] = useState<FormState>({
    productChoice: {
      preset_product_ids: ['flyer_promo'],
      custom: { name: '', image_url: '', description: '' },
    },
    stylePreset: 'CORPORATE_PRO',
    contextMode: 'IN_STORE_MENU',
    contextPromptFreeform: '',
    customScenePrompt:
      'Un repas simple du soir, la famille est réunie autour de la table, ambiance vraie, chaleureuse, naturelle.',
    outputPack: ['SOCIAL_SQUARE', 'POST_VERTICAL', 'STORY', 'WEB_HERO'],
    overlays: defaultOverlays,
    consistencySeed: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (formState.outputPack.length === 0) {
      setError('Veuillez sélectionner au moins un format de sortie.');
      return;
    }
    if (formState.productChoice.preset_product_ids.length === 0) {
      setError('Veuillez sélectionner au moins un produit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setProgressMessage('Initialisation de la génération...');

    const generationState: FormState = {
      ...formState,
      consistencySeed: String(Math.floor(Math.random() * 2147483647)),
    };

    try {
      const finalImages: GeneratedImage[] = [];
      const totalSteps = generationState.outputPack.length;
      let currentStep = 1;

      for (const packId of generationState.outputPack) {
        const spec = OUTPUT_SPECS[packId];
        const label = OUTPUT_PACK_LABELS[packId];
        setProgressMessage(
          `Étape ${currentStep}/${totalSteps} : Génération du format "${label}" (${spec.px[0]}x${spec.px[1]}px)...`,
        );

        const prompt = buildImagePrompt(generationState, spec);

        // Map ratio for API
        let apiRatio = spec.ratio;
        if (apiRatio === '4:5') apiRatio = '3:4';
        if (apiRatio === '3:2') apiRatio = '4:3';

        const result = await generateImage(prompt, apiRatio);

        finalImages.push({
          id: packId,
          url: `data:image/png;base64,${result.imageBase64}`,
          history: [],
          label,
          spec,
          overlays: deepCloneOverlays(generationState.overlays),
        });

        setGeneratedImages([...finalImages]);
        currentStep++;
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Une erreur est survenue lors de la génération.');
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [formState]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header onBack={onBack} />
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <ControlPanel
              formState={formState}
              setFormState={setFormState}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-9">
            <Gallery
              isLoading={isLoading}
              error={error}
              images={generatedImages}
              progressMessage={progressMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
