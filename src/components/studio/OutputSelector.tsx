import React from 'react';
import { Card } from '../common/Card';
import type { OutputPackId } from '../../types';
import { OUTPUT_PACK_OPTIONS } from '../../constants';

interface OutputSelectorProps {
  value: OutputPackId[];
  onChange: (v: OutputPackId[]) => void;
}

export const OutputSelector: React.FC<OutputSelectorProps> = ({ value, onChange }) => {
  const toggle = (id: OutputPackId) => {
    const isSelected = value.includes(id);
    onChange(isSelected ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <Card title="Formats de sortie">
      <div className="grid grid-cols-2 gap-1.5">
        {OUTPUT_PACK_OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
