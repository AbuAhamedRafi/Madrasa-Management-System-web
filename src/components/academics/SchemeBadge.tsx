import React from 'react';
import type { AcademicScheme } from '../../types/academics';
import { useTranslation } from 'react-i18next';

interface Props {
  scheme: AcademicScheme;
}

export const SchemeBadge: React.FC<Props> = ({ scheme }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  if (scheme === 'SESSION_BASED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
        {isBn ? 'সেশন-ভিত্তিক (SESSION_BASED)' : 'Session-Based'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200">
      {isBn ? 'বার্ষিক ক্লাস (CALENDAR_YEAR)' : 'Calendar Year'}
    </span>
  );
};

