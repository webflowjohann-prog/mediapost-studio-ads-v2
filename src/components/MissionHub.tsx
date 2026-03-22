import React from 'react';
import { BRAND } from '../constants';

interface MissionHubProps {
  onSelectMission: (missionId: string) => void;
}

const missions = [
  {
    id: 'quick_ads',
    title: 'Studio ADS',
    subtitle: 'IMAGES & PRINT',
    description:
      'Génération de visuels publicitaires pour vos campagnes de prospectus, affichage local et réseaux sociaux. Packshots, mises en scène, respectant la charte de vos clients annonceurs.',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    accent: 'bg-brand-red',
    accentText: 'text-brand-red',
    cta: 'Lancer le studio',
  },
  {
    id: 'avatar_platform',
    title: 'Avatar Platform',
    subtitle: 'STUDIO VIDÉO',
    description:
      'Créez des vidéos ultra-réalistes avec des avatars virtuels pour présenter vos offres locales. Personnalisez tenues, dialogues et ambiance.',
    imageUrl:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
    accent: 'bg-gray-900',
    accentText: 'text-gray-900',
    cta: 'Lancer la plateforme',
  },
];

export const MissionHub: React.FC<MissionHubProps> = ({ onSelectMission }) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={BRAND.default_logo_url}
              alt="Mediapost"
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-brand-red tracking-tight">
              Studio ADS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-blue">V2.0</span>
            <span className="text-xs text-gray-400 font-medium">
              Powered by AI
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Choisissez votre mission
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Une suite d'outils créatifs propulsés par l'IA pour accélérer la
            communication de proximité.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMission(m.id)}
              className="group card-hover text-left p-0 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-56 relative overflow-hidden">
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span
                  className={`absolute top-4 left-4 ${m.accent} text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest`}
                >
                  {m.subtitle}
                </span>
              </div>

              {/* Content */}
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className={`text-lg font-bold text-gray-900 mb-2 group-hover:${m.accentText} transition-colors`}
                  >
                    {m.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div
                  className={`flex items-center ${m.accentText} font-semibold text-sm uppercase tracking-wider mt-5 group-hover:translate-x-1 transition-transform`}
                >
                  {m.cta}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-16">
          {BRAND.tagline} · Propulsé par Imagen 3 & Veo 3.1
        </p>
      </main>
    </div>
  );
};
