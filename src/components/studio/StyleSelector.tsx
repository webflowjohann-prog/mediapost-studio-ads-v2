import React from 'react';
import { Card } from '../common/Card';
import type { StylePresetId } from '../../types';
import { STYLE_PRESETS } from '../../constants';

interface StyleSelectorProps {
  value: StylePresetId;
  onChange: (v: StylePresetId) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => (
  <Card title="Style photographique">
    <div className="space-y-1.5">
      {(Object.entries(STYLE_PRESETS) as [StylePresetId, typeof STYLE_PRESETS[StylePresetId]][]).map(
        ([id, preset]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              value === id
                ? 'bg-brand-red/5 border border-brand-red/20 text-brand-red'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <span className="font-medium">{preset.label}</span>
            <span className="block text-xs opacity-70 mt-0.5">{preset.description}</span>
          </button>
        ),
      )}
    </div>
  </Card>
);
