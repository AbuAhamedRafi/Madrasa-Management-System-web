import React from 'react';
import type { AcademicScheme } from '../../../../types/academics';
import { SchemeBadge } from '../../../../components/academics/SchemeBadge';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface Props {
  scheme: AcademicScheme;
  durationYears: number;
  classesCount: number;
  tracksCount: number;
}

export const ProgramConfigSummaryCard: React.FC<Props> = ({
  scheme,
  durationYears,
  classesCount,
  tracksCount,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
        <Info className="w-4 h-4" />
        <span>{isBn ? 'স্কিম কনফিগারেশন নির্দেশিকা' : 'Scheme Configuration Guide'}</span>
      </div>

      <div>
        <SchemeBadge scheme={scheme} />
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        {scheme === 'SESSION_BASED'
          ? isBn
            ? 'সেশন-ভিত্তিক প্রোগ্রামের ক্ষেত্রে (যেমন আলিম, ফাযিল, কামিল, দাওরায়ে হাদীস) প্রতিটি শিক্ষাবর্ষ একটি ভর্তি ব্যাচ (Admission Cohort যেমন 2026-27)-এর সাথে যুক্ত থাকবে।'
            : 'In SESSION_BASED programs (e.g. Alim, Fazil, Kamil, Dawra-e-Hadith), each study period belongs to an admission cohort (e.g. 2026-27) and a study year number.'
          : isBn
          ? 'বার্ষিক ক্লাস প্রোগ্রামের ক্ষেত্রে (যেমন ইবতেদায়ী, দাখিল, হিফজ) শিক্ষাবর্ষগুলো সরাসরি ক্যালেন্ডার বর্ষ (যেমন ২০২৬ শিক্ষাবর্ষ) অনুযায়ী পরিচালিত হয়।'
          : 'In CALENDAR_YEAR programs (e.g. Ebtedayee, Dakhil, Hifz), study periods run per calendar year without requiring an admission cohort.'}
      </p>

      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-700">
        <div className="flex justify-between">
          <span>{isBn ? 'নির্ধারিত মেয়াদ:' : 'Configured Duration:'}</span>
          <span className="font-semibold">
            {durationYears} {isBn ? 'বছর' : 'Years'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isBn ? 'মোট ক্লাস / স্তর:' : 'Total Classes / Stages:'}</span>
          <span className="font-semibold">{classesCount}</span>
        </div>
        <div className="flex justify-between">
          <span>{isBn ? 'মোট ট্র্যাক / গ্রুপ:' : 'Total Tracks:'}</span>
          <span className="font-semibold">{tracksCount}</span>
        </div>
      </div>
    </div>
  );
};
