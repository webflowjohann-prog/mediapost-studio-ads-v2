import React from 'react';
import { Card } from '../common/Card';
import type { ContextModeId } from '../../types';
import { CONTEXT_MODES } from '../../constants';

interface ContextSelectorProps {
  value: ContextModeId;
  onChange: (v: ContextModeId) => void;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({ value, onChange }) => (
  <Card title="Contexte de campagne">
    <div className="flex flex-wrap gap-1.5">
      {(Object.entries(CONTEXT_MODES) as [ContextModeId, typeof CONTEXT_MODES[ContextModeId]][]).map(
        ([id, mode]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              value === id
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode.label}
          </button>
        ),
      )}
    </div>
  </Card>
);
