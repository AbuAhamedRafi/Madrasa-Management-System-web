import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AdmissionStatus, EnrollmentStatus } from '../../types/admissions';

interface Props {
  status: EnrollmentStatus | AdmissionStatus | string;
  size?: 'sm' | 'md';
}

export const AdmissionStatusChip: React.FC<Props> = ({ status, size = 'sm' }) => {
  const { t } = useTranslation();

  const getStyle = () => {
    switch (status) {
      case 'PENDING_BILLING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING_PAYMENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING_ACTIVATION':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'DRAFT':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    return t(`status_${status}`, status);
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getStyle()} ${sizeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'APPROVED' || status === 'ACTIVE'
            ? 'bg-emerald-500'
            : status === 'PENDING_BILLING'
            ? 'bg-amber-500'
            : status === 'PENDING_PAYMENT'
            ? 'bg-indigo-500'
            : status === 'REJECTED'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {getLabel()}
    </span>
  );
};
