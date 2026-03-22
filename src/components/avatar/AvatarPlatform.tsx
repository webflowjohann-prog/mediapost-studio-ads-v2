import React, { useState } from 'react';
import { AVATARS, LANGUAGES, TONES, CAMERA_ANGLES, CAMERA_ZOOMS } from '../../constants';
import type { Avatar, Tone, CameraAngle, CameraZoom, Language } from '../../types';

interface AvatarPlatformProps {
  onBack: () => void;
}

export const AvatarPlatform: React.FC<AvatarPlatformProps> = ({ onBack }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedTone, setSelectedTone] = useState<Tone>(TONES[0]);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CAMERA_ANGLES[0]);
  const [cameraZoom, setCameraZoom] = useState<CameraZoom>(CAMERA_ZOOMS[2]);
  const [universePrompt, setUniversePrompt] = useState('');
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedAvatar) {
      setError('Veuillez sélectionner un avatar.');
      return;
    }
    if (!universePrompt) {
      setError("Veuillez décrire l'univers narratif.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // TODO Phase 4: Intégrer generateAvatarVideo
      await new Promise((r) => setTimeout(r, 2000));
      setError('La génération vidéo sera activée en Phase 4. Les API Veo 3.1 sont configurées et prêtes.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col lg:flex-row text-gray-200">
      {/* Sidebar */}
      <aside className="w-full lg:w-[22rem] bg-[#1a1a1a] p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">Avatar Platform</h1>
        </div>

        {/* Avatar Selection */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Choisir un avatar
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                  selectedAvatar?.id === avatar.id
                    ? 'border-brand-red ring-2 ring-brand-red/30'
                    : 'border-transparent hover:border-gray-600'
                }`}
              >
                <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {selectedAvatar && (
            <p className="text-xs text-gray-400 mt-2">
              Sélectionné : <span className="text-white font-medium">{selectedAvatar.name}</span>
            </p>
          )}
        </div>

        {/* Universe Prompt */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Univers narratif
          </h3>
          <textarea
            value={universePrompt}
            onChange={(e) => setUniversePrompt(e.target.value)}
            placeholder="Décrivez le décor, l'ambiance..."
            rows={3}
            className="w-full px-3 py-2.5 bg-[#252525] border border-[#333] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/50 resize-none"
          />
        </div>

        {/* Script */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Dialogue
          </h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Texte prononcé par l'avatar..."
            rows={2}
            className="w-full px-3 py-2.5 bg-[#252525] border border-[#333] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/50 resize-none"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Ton</label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as Tone)}
              className="w-full mt-1 px-2 py-1.5 bg-[#252525] border border-[#333] rounded-lg text-xs text-gray-300"
            >
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Caméra</label>
            <select
              value={cameraAngle}
              onChange={(e) => setCameraAngle(e.target.value as CameraAngle)}
              className="w-full mt-1 px-2 py-1.5 bg-[#252525] border border-[#333] rounded-lg text-xs text-gray-300"
            >
              {CAMERA_ANGLES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl transition-all disabled:bg-gray-700 disabled:cursor-not-allowed mt-auto"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Génération...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Générer la Vidéo
            </>
          )}
        </button>
      </aside>

      {/* Main Preview */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4 max-w-lg w-full">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {videoUrl ? (
          <video src={videoUrl} controls className="max-w-2xl w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl aspect-video flex flex-col items-center justify-center border border-[#2a2a2a]">
            <div className="w-16 h-16 bg-[#252525] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Aucune vidéo générée</p>
            <p className="text-gray-600 text-xs mt-1">Configurez et lancez la génération</p>
          </div>
        )}
      </main>
    </div>
  );
};
