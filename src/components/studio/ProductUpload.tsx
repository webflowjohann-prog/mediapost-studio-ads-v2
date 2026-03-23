import React, { useRef, useState } from 'react';
import type { FormState } from '../../types';

interface ProductUploadProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const ProductUpload: React.FC<ProductUploadProps> = ({ formState, setFormState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(formState.productChoice.custom.image_url || '');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewUrl(dataUrl);
      setFormState((s) => ({
        ...s,
        productChoice: {
          ...s.productChoice,
          custom: { ...s.productChoice.custom, image_url: dataUrl },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setFormState((s) => ({
      ...s,
      productChoice: {
        ...s.productChoice,
        custom: { ...s.productChoice.custom, image_url: urlInput.trim() },
      },
    }));
    setShowUrlInput(false);
  };

  const removeImage = () => {
    setPreviewUrl('');
    setFormState((s) => ({
      ...s,
      productChoice: {
        ...s.productChoice,
        custom: { ...s.productChoice.custom, image_url: '' },
      },
    }));
  };

  return (
    <div className="card">
      <h3 className="section-title">1. Produit</h3>

      {/* Image Upload Zone */}
      <div className="mb-3">
        {previewUrl ? (
          <div className="relative group rounded-xl overflow-hidden">
            <img src={previewUrl} alt="Produit" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <button
                onClick={removeImage}
                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-600 transition-opacity"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red/40 hover:bg-red-50/30 transition-all"
          >
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Cliquez pour uploader</span>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {/* URL toggle */}
        {!previewUrl && (
          <div className="mt-2">
            {showUrlInput ? (
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://..."
                  className="input-field text-xs py-1.5 flex-1"
                />
                <button onClick={handleUrlSubmit} className="px-3 py-1.5 bg-brand-red text-white text-xs rounded-lg font-medium">
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowUrlInput(true)}
                className="text-xs text-gray-400 hover:text-brand-red transition-colors"
              >
                ou coller un lien image
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Name */}
      <input
        type="text"
        value={formState.productChoice.custom.name}
        onChange={(e) =>
          setFormState((s) => ({
            ...s,
            productChoice: {
              ...s.productChoice,
              custom: { ...s.productChoice.custom, name: e.target.value },
            },
          }))
        }
        placeholder="Nom du produit / de l'offre"
        className="input-field text-sm mb-2"
      />

      {/* Short Description */}
      <textarea
        value={formState.productChoice.custom.description}
        onChange={(e) =>
          setFormState((s) => ({
            ...s,
            productChoice: {
              ...s.productChoice,
              custom: { ...s.productChoice.custom, description: e.target.value },
            },
          }))
        }
        placeholder="Description courte pour le contexte IA (ex: promo -30% sur les pizzas, livraison gratuite...)"
        rows={2}
        className="input-field text-sm resize-none"
      />
    </div>
  );
};
