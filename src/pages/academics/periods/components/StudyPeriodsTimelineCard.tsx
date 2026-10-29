import React from 'react';
import type { AcademicPeriod } from '../../../../types/academics';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Layers, Lock } from 'lucide-react';

interface Props {
  periods: AcademicPeriod[];
  canManagePeriods: boolean;
  onOpenCreatePeriod: () => void;
}

export const StudyPeriodsTimelineCard: React.FC<Props> = ({
  periods,
  canManagePeriods,
  onOpenCreatePeriod,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isBn ? 'শিক্ষাবর্ষ ও সেশন পিরিয়ড তালিকা' : 'Academic Study Periods'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'তারিখ কখনো সেশন লেবেল থেকে অনুমান করা হয় না—প্রতিটি পিরিয়ডের সুনির্দিষ্ট শুরুর ও শেষ তারিখ রয়েছে'
              : 'Explicit start and end dates for each study year or calendar year period'}
          </p>
        </div>

        {canManagePeriods && (
          <button
            type="button"
            onClick={onOpenCreatePeriod}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
          >
            <Plus className="w-3.5 h-3.5" />
            {isBn ? 'নতুন শিক্ষাবর্ষ / পিরিয়ড' : 'New Study Period'}
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {periods.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isBn ? 'কোনো শিক্ষাবর্ষ পাওয়া যায়নি।' : 'No study periods found for the selected filter.'}
          </div>
        ) : (
          periods.map((p) => (
            <div
              key={p.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-sm">{p.label}</span>
                  <PeriodStatusChip state={p.state} />
                  {p.cohort && (
                    <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                      {isBn ? 'সেশন:' : 'Cohort:'} {p.cohort.label}
                    </span>
                  )}
                  {p.study_year_number && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {isBn ? `বর্ষ #${p.study_year_number}` : `Study Year #${p.study_year_number}`}
                    </span>
                  )}
                  {p.calendar_year && (
                    <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      {isBn ? `ক্যালেন্ডার বর্ষ: ${p.calendar_year}` : `Year: ${p.calendar_year}`}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                  {p.program && (
                    <span className="font-medium text-slate-800">
                      {isBn ? p.program.name_bn : p.program.name_en}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.start_date} → {p.end_date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/app/academics/offerings?academic_period_id=${p.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-700" />
                  {isBn ? 'অফারিং ও শাখা' : 'Offerings'}
                </Link>
                <Link
                  to={`/app/academics/periods/${p.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-teal-700 hover:bg-teal-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isBn ? 'লাইফসাইকেল / ক্লোজার' : 'Lifecycle'}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
