import React from 'react';
import type { GeneratedImage } from '../../types';

interface GalleryProps {
  isLoading: boolean;
  error: string | null;
  images: GeneratedImage[];
  progressMessage: string | null;
}

export const Gallery: React.FC<GalleryProps> = ({
  isLoading,
  error,
  images,
  progressMessage,
}) => {
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading && images.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-red/20 rounded-full" />
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">{progressMessage || 'Génération en cours...'}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-gray-700 font-semibold mb-1">Aucun visuel généré</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Configurez vos produits et paramètres, puis cliquez sur "Générer les visuels".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar if still loading */}
      {isLoading && progressMessage && (
        <div className="card py-3">
          <p className="text-sm text-gray-600 mb-2">{progressMessage}</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-red rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="card p-3 group">
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-auto"
              />
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2 mb-3">
                  <a
                    href={img.url}
                    download={`mediapost_${img.id}.png`}
                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Télécharger
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{img.label}</span>
              <span className="text-[10px] text-gray-400">
                {img.spec.px[0]}x{img.spec.px[1]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
