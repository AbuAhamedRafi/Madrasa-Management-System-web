import React from 'react';
import type { PeriodState, ProgramState, CohortStatus } from '../../types/academics';
import { useTranslation } from 'react-i18next';

interface Props {
  state: PeriodState | ProgramState | CohortStatus | string;
}

export const PeriodStatusChip: React.FC<Props> = ({ state }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const getStyleAndLabel = () => {
    switch (state) {
      case 'ACTIVE':
      case 'OPEN':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label:
            state === 'OPEN'
              ? isBn
                ? 'চলমান (Open)'
                : 'Open'
              : isBn
              ? 'সক্রিয় (Active)'
              : 'Active',
        };
      case 'DRAFT':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: isBn ? 'খসড়া (Draft)' : 'Draft',
        };
      case 'CLOSED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: isBn ? 'বন্ধ (Closed)' : 'Closed',
        };
      case 'INACTIVE':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: state,
        };
    }
  };

  const { bg, label } = getStyleAndLabel();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      {label}
    </span>
  );
};
