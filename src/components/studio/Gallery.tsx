import React, { useState } from 'react';
import type { GeneratedImage } from '../../types';

interface GalleryProps {
  isLoading: boolean;
  error: string | null;
  images: GeneratedImage[];
  progressMessage: string | null;
  onEditImage: (imageId: string, prompt: string) => Promise<void>;
  onGenerateVideo: (imageId: string, prompt: string) => Promise<void>;
}

const ImageCard: React.FC<{
  img: GeneratedImage;
  onEditImage: (imageId: string, prompt: string) => Promise<void>;
  onGenerateVideo: (imageId: string, prompt: string) => Promise<void>;
}> = ({ img, onEditImage, onGenerateVideo }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    try {
      await onEditImage(img.id, editPrompt);
      setEditPrompt('');
    } catch {} finally {
      setIsEditing(false);
    }
  };

  const handleAnimate = async () => {
    if (!videoPrompt.trim()) return;
    setIsAnimating(true);
    try {
      await onGenerateVideo(img.id, videoPrompt);
    } catch {} finally {
      setIsAnimating(false);
    }
  };

  return (
    <div className="card p-4 animate-fade-in">
      {/* Image */}
      <div className="relative rounded-xl overflow-hidden mb-3 group">
        <img src={img.url} alt={img.label} className="w-full h-auto" />
        {/* Download overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={img.url}
            download={`mediapost_${img.id}.png`}
            className="p-2 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
            title="Télécharger"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* Label & specs */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">{img.label}</span>
        <span className="text-[10px] text-gray-400 tabular-nums">{img.spec.px[0]}x{img.spec.px[1]}</span>
      </div>

      {/* Edit prompt */}
      <div className="mb-2">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">Modifier l'image</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
            placeholder="Ex: rendre le fond plus chaud, ajouter des confettis..."
            className="input-field text-xs py-2 flex-1"
            disabled={isEditing}
          />
          <button
            onClick={handleEdit}
            disabled={isEditing || !editPrompt.trim()}
            className="px-3 py-2 bg-brand-red text-white text-xs font-medium rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isEditing ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Video animation prompt */}
      <div>
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">Animer en vidéo</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnimate()}
            placeholder="Ex: zoom lent, vapeur qui monte, personnage qui sourit..."
            className="input-field text-xs py-2 flex-1"
            disabled={isAnimating}
          />
          <button
            onClick={handleAnimate}
            disabled={isAnimating || !videoPrompt.trim()}
            className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isAnimating ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Le logo et le texte restent statiques pendant l'animation.</p>
      </div>

      {/* Video player if generated */}
      {img.videoUrl && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <video src={img.videoUrl} controls className="w-full" />
        </div>
      )}

      {img.isVideoLoading && (
        <div className="mt-3 flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-xl">
          <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs text-gray-500">Génération vidéo en cours (peut prendre 2 à 5 min)...</span>
        </div>
      )}

      {img.videoGenerationError && (
        <p className="mt-2 text-xs text-red-500">{img.videoGenerationError}</p>
      )}
    </div>
  );
};

export const Gallery: React.FC<GalleryProps> = ({
  isLoading,
  error,
  images,
  progressMessage,
  onEditImage,
  onGenerateVideo,
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
          Configurez votre produit et votre scène, puis cliquez sur "Générer les visuels".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && progressMessage && (
        <div className="card py-3">
          <p className="text-sm text-gray-600 mb-2">{progressMessage}</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-red rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            img={img}
            onEditImage={onEditImage}
            onGenerateVideo={onGenerateVideo}
          />
        ))}
      </div>
    </div>
  );
};
