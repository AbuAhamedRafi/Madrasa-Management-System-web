import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SectionCapacity } from '../../types/admissions';
import { Users } from 'lucide-react';

interface Props {
  capacity: SectionCapacity;
  showLabels?: boolean;
}

export const CapacityMeter: React.FC<Props> = ({ capacity, showLabels = true }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const percent = Math.min(100, Math.round((capacity.occupied_seats / capacity.capacity) * 100));

  const getMeterColor = () => {
    if (capacity.is_full || percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {isBn ? capacity.section_name_bn : capacity.section_name_en} ({capacity.section_code})
          </span>
          <span className="font-semibold text-slate-800">
            {capacity.occupied_seats} / {capacity.capacity}{' '}
            <span className="text-slate-500 font-normal">
              ({isBn ? `${capacity.available_seats} আসন খালি` : `${capacity.available_seats} free`})
            </span>
          </span>
        </div>
      )}

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getMeterColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

