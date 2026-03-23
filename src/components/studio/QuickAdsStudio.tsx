import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { ControlPanel } from './ControlPanel';
import { Gallery } from './Gallery';
import { generateImage, editImage, generateVideo, buildImagePrompt } from '../../services/api';
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
      preset_product_ids: [],
      custom: { name: '', image_url: '', description: '' },
    },
    stylePreset: 'CORPORATE_PRO',
    contextMode: 'IN_STORE_MENU',
    contextPromptFreeform: '',
    customScenePrompt: '',
    outputPack: ['SOCIAL_SQUARE', 'STORY'],
    overlays: defaultOverlays,
    consistencySeed: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  // --- Generate all formats ---
  const handleGenerate = useCallback(async () => {
    if (formState.outputPack.length === 0) {
      setError('Veuillez sélectionner au moins un format de sortie.');
      return;
    }
    if (!formState.productChoice.custom.name && !formState.productChoice.custom.image_url) {
      setError('Veuillez ajouter un produit (image ou nom).');
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
      let lastError: string | null = null;

      for (const packId of generationState.outputPack) {
        const spec = OUTPUT_SPECS[packId];
        const label = OUTPUT_PACK_LABELS[packId];
        setProgressMessage(
          `Étape ${currentStep}/${totalSteps} : "${label}" (${spec.px[0]}x${spec.px[1]})...`,
        );

        const prompt = buildImagePrompt(generationState, spec);
        let apiRatio = spec.ratio;
        if (apiRatio === '4:5') apiRatio = '3:4';
        if (apiRatio === '3:2') apiRatio = '4:3';

        // Extract product image base64 if available (for visual reference)
        let referenceImageBase64: string | undefined;
        const productImageUrl = generationState.productChoice.custom.image_url;
        if (productImageUrl && productImageUrl.startsWith('data:')) {
          referenceImageBase64 = productImageUrl.split(',')[1];
        }

        try {
          const result = await generateImage(prompt, apiRatio, referenceImageBase64);
          finalImages.push({
            id: packId,
            url: `data:image/png;base64,${result.imageBase64}`,
            history: [],
            label,
            spec,
            overlays: deepCloneOverlays(generationState.overlays),
          });
          setGeneratedImages([...finalImages]);
        } catch (formatError: any) {
          console.warn(`Format ${label} failed:`, formatError.message);
          lastError = `Format "${label}": ${formatError.message}`;
        }

        currentStep++;
        if (currentStep <= totalSteps) {
          setProgressMessage(`Pause avant le prochain format...`);
          await new Promise((r) => setTimeout(r, 4000));
        }
      }

      if (finalImages.length === 0 && lastError) {
        setError(lastError);
      } else if (lastError && finalImages.length > 0) {
        // Partial success = show warning, not error
        setError(`✅ ${finalImages.length}/${totalSteps} visuels générés. ⚠️ Format échoué : ${lastError}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [formState]);

  // --- Edit a single image ---
  const handleEditImage = useCallback(
    async (imageId: string, prompt: string) => {
      const original = generatedImages.find((img) => img.id === imageId);
      if (!original) return;

      const originalBase64 = original.url.split(',')[1];
      if (!originalBase64) throw new Error("Could not extract image data.");

      const result = await editImage(originalBase64, prompt);

      setGeneratedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                url: `data:image/png;base64,${result.imageBase64}`,
                history: [...img.history, img.url],
              }
            : img,
        ),
      );
    },
    [generatedImages],
  );

  // --- Generate video from an image ---
  const handleGenerateVideo = useCallback(
    async (imageId: string, prompt: string) => {
      const image = generatedImages.find((img) => img.id === imageId);
      if (!image) return;

      setGeneratedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, isVideoLoading: true, videoGenerationError: undefined } : img,
        ),
      );

      try {
        const imageBase64 = image.url.split(',')[1];
        if (!imageBase64) throw new Error("Could not extract image data.");

        // Animation prompt: the logo and text must stay static
        const videoPromptWithConstraint = `${prompt}. CONSTRAINT: Any logo or text overlay on the image must remain perfectly static and not move or deform. Only the background and main subject should animate.`;

        const result = await generateVideo(imageBase64, videoPromptWithConstraint, image.spec.ratio, 'fast');

        // Convert base64 video to blob URL
        const binaryString = atob(result.videoBase64 || '');
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const videoUrl = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));

        setGeneratedImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, videoUrl, isVideoLoading: false } : img,
          ),
        );
      } catch (e: any) {
        setGeneratedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, isVideoLoading: false, videoGenerationError: `Erreur: ${e.message}` }
              : img,
          ),
        );
      }
    },
    [generatedImages],
  );

  // --- Apply global overlay template ---
  const handleApplyGlobalOverlays = useCallback(() => {
    if (generatedImages.length === 0) return;
    setGeneratedImages((prev) =>
      prev.map((img) => ({ ...img, overlays: deepCloneOverlays(formState.overlays) })),
    );
  }, [formState.overlays, generatedImages.length]);

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header onBack={onBack} />
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <ControlPanel
              formState={formState}
              setFormState={setFormState}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              hasImages={generatedImages.length > 0}
              onApplyGlobalOverlays={handleApplyGlobalOverlays}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <Gallery
              isLoading={isLoading}
              error={error}
              images={generatedImages}
              progressMessage={progressMessage}
              onEditImage={handleEditImage}
              onGenerateVideo={handleGenerateVideo}
              onImageOverlaysChange={(imageId, overlays) => {
                setGeneratedImages((prev) =>
                  prev.map((img) => (img.id === imageId ? { ...img, overlays } : img)),
                );
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
