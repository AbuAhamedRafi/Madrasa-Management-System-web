import React from 'react';
import type { StudentStatus } from '../../types/students';
import { useTranslation } from 'react-i18next';

interface Props {
  status: StudentStatus;
}

export const StudentStatusBadge: React.FC<Props> = ({ status }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const configs: Record<StudentStatus, { labelBn: string; labelEn: string; classes: string }> = {
    REGISTERED: {
      labelBn: 'নিবন্ধিত (ফি অপেক্ষমাণ)',
      labelEn: 'Registered (Pending Fee)',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    ACTIVE: {
      labelBn: 'সক্রিয়',
      labelEn: 'Active',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    INACTIVE: {
      labelBn: 'নিষ্ক্রিয়',
      labelEn: 'Inactive',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    WITHDRAWN: {
      labelBn: 'প্রত্যাহারকৃত',
      labelEn: 'Withdrawn',
      classes: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    TRANSFERRED: {
      labelBn: 'স্থানান্তরিত',
      labelEn: 'Transferred',
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    GRADUATED: {
      labelBn: 'উত্তীর্ণ',
      labelEn: 'Graduated',
      classes: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    ARCHIVED: {
      labelBn: 'সংরক্ষিত (আর্কাইভ)',
      labelEn: 'Archived',
      classes: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  };

  const config = configs[status] || {
    labelBn: status,
    labelEn: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {isBn ? config.labelBn : config.labelEn}
    </span>
  );
};
