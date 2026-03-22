import React from 'react';
import { Card } from '../common/Card';
import type { FormState } from '../../types';
import { PRODUCTS, MAX_PRODUCTS } from '../../constants';

interface ProductSelectorProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ formState, setFormState }) => {
  const selectedIds = formState.productChoice.preset_product_ids;

  const toggleProduct = (id: string) => {
    setFormState((prev) => {
      const current = prev.productChoice.preset_product_ids;
      const isSelected = current.includes(id);
      const newIds = isSelected
        ? current.filter((pid) => pid !== id)
        : current.length < MAX_PRODUCTS
          ? [...current, id]
          : current;
      return {
        ...prev,
        productChoice: { ...prev.productChoice, preset_product_ids: newIds },
      };
    });
  };

  return (
    <Card title={`Produits (${selectedIds.length}/${MAX_PRODUCTS})`}>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCTS.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggleProduct(p.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-brand-red ring-2 ring-brand-red/20'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <img
                src={p.image_url}
                alt={p.label}
                className="w-full h-20 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-white text-[11px] font-medium">
                {p.label}
              </span>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-red rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
