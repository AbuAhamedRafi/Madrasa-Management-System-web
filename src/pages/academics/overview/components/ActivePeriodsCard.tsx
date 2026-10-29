import React from 'react';
import type { AcademicPeriod } from '../../../../types/academics';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Lock } from 'lucide-react';

interface Props {
  periods: AcademicPeriod[];
}

export const ActivePeriodsCard: React.FC<Props> = ({ periods }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {isBn ? 'শিক্ষাবর্ষ ও সেশন টাইমলাইন' : 'Study Periods & Session Timeline'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'সকল প্রোগ্রামের চলমান ও খসড়া শিক্ষাবর্ষের সময়সূচি'
              : 'Open and draft study periods across all programs'}
          </p>
        </div>
        <Link
          to="/app/academics/periods"
          className="text-xs font-medium text-teal-700 hover:text-teal-800"
        >
          {isBn ? 'সকল সেশন ও পিরিয়ড দেখুন →' : 'View All Periods →'}
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {periods.map((period) => (
          <div
            key={period.id}
            className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm">{period.label}</span>
                <PeriodStatusChip state={period.state} />
                {period.cohort && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {isBn ? 'সেশন:' : 'Cohort:'} {period.cohort.label}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                {period.program && (
                  <span className="font-medium text-slate-800">
                    {isBn ? period.program.name_bn : period.program.name_en}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {period.start_date} → {period.end_date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/app/academics/offerings?academic_period_id=${period.id}`}
                className="px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {isBn ? 'ক্লাস ও শাখা' : 'Classes & Sections'}
              </Link>
              <Link
                to={`/app/academics/periods/${period.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-teal-700 hover:bg-teal-50"
              >
                <Lock className="w-3.5 h-3.5" />
                {isBn ? 'লাইফসাইকেল / ক্লোজার' : 'Lifecycle'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
