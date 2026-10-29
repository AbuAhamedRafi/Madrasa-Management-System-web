import React from 'react';
import type { AcademicCohort, AcademicProgram } from '../../../../types/academics';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';

interface Props {
  program: AcademicProgram | null;
  cohorts: AcademicCohort[];
  selectedCohortId: number | null;
  onSelectCohort: (id: number | null) => void;
  canManageCohorts: boolean;
  onOpenCreate: () => void;
}

export const AdmissionCohortsCard: React.FC<Props> = ({
  program,
  cohorts,
  selectedCohortId,
  onSelectCohort,
  canManageCohorts,
  onOpenCreate,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  if (program && program.scheme === 'CALENDAR_YEAR') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">
          {isBn ? 'ভর্তি ব্যাচ / সেশন প্রযোজ্য নয়' : 'Cohorts Not Required (Calendar Year)'}
        </h3>
        <p className="text-xs text-slate-500">
          {isBn
            ? 'এই প্রোগ্রামটি বার্ষিক ক্লাস স্কিম (CALENDAR_YEAR) অনুসরণ করে, তাই সেশন ব্যাচের পরিবর্তে সরাসরি বার্ষিক শিক্ষাবর্ষ ব্যবহৃত হয়।'
            : 'This program uses the CALENDAR_YEAR scheme. Study periods run directly per calendar year.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isBn ? 'ভর্তি সেশন / ব্যাচ (Admission Cohorts)' : 'Admission Cohorts / Sessions'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn ? 'যেমন: 2025-26, 2026-27 সেশন ব্যাচ' : 'e.g. 2025-26, 2026-27 intake cohorts'}
          </p>
        </div>

        {canManageCohorts && program?.scheme === 'SESSION_BASED' && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
          >
            <Plus className="w-3.5 h-3.5" />
            {isBn ? 'নতুন সেশন' : 'New Cohort'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-2">
        <button
          type="button"
          onClick={() => onSelectCohort(null)}
          className={`w-full text-left px-3.5 py-2 rounded-lg border text-xs font-medium transition ${
            selectedCohortId === null
              ? 'border-teal-600 bg-teal-50/60 text-teal-900'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {isBn ? 'সকল সেশন ব্যাচ দেখুন' : 'Show All Cohorts'}
        </button>

        {cohorts.map((cohort) => (
          <button
            key={cohort.id}
            type="button"
            onClick={() => onSelectCohort(cohort.id)}
            className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
              selectedCohortId === cohort.id
                ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold text-slate-900 text-sm">{cohort.label}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isBn ? 'ভর্তি বর্ষ:' : 'Intake Year:'} {cohort.intake_year} •{' '}
                {isBn ? 'পিরিয়ড:' : 'Periods:'} {cohort.periods_count ?? 0}
              </div>
            </div>
            <PeriodStatusChip state={cohort.status} />
          </button>
        ))}
      </div>
    </div>
  );
};
