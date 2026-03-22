import React from 'react';
import { BRAND } from '../../constants';

interface HeaderProps {
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack }) => (
  <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          title="Retour aux missions"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <img
          src={BRAND.default_logo_url}
          alt="Mediapost"
          className="h-7 w-auto"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <h1 className="text-base font-bold text-gray-900">
          Studio ADS
        </h1>
      </div>
      <p className="hidden md:block text-xs text-gray-400">
        Vision Stratégique · Intelligence Artificielle
      </p>
    </div>
  </header>
);
