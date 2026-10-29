import React, { useState } from 'react';
import type { AcademicCohort, AcademicProgram } from '../../../../types/academics';
import { academicsApi } from '../../../../services/academicsApi';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  program: AcademicProgram;
  cohorts: AcademicCohort[];
  onClose: () => void;
  onCreated: () => void;
}

export const CreatePeriodModal: React.FC<Props> = ({
  isOpen,
  program,
  cohorts,
  onClose,
  onCreated,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const isSession = program.scheme === 'SESSION_BASED';

  const [label, setLabel] = useState('');
  const [cohortId, setCohortId] = useState<number | ''>(cohorts[0]?.id ?? '');
  const [studyYearNumber, setStudyYearNumber] = useState(1);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await academicsApi.createPeriod({
        program_id: program.id,
        label,
        cohort_id: isSession ? Number(cohortId) : null,
        study_year_number: isSession ? Number(studyYearNumber) : null,
        calendar_year: !isSession ? Number(calendarYear) : null,
        start_date: startDate,
        end_date: endDate,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create academic period.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isBn ? 'নতুন শিক্ষাবর্ষ / পিরিয়ড তৈরি করুন' : 'Create Academic Study Period'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'পিরিয়ড লেবেল *' : 'Period Label *'}
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={isSession ? 'e.g. 2026-27 — 1st Year' : 'e.g. Academic Year 2026'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {isSession ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'ভর্তি সেশন (Cohort) *' : 'Admission Cohort *'}
                </label>
                <select
                  required
                  value={cohortId}
                  onChange={(e) => setCohortId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">{isBn ? '-- নির্বাচন --' : '-- Select --'}</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'অধ্যয়ন বর্ষ নম্বর *' : 'Study Year # *'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={program.duration_years}
                  required
                  value={studyYearNumber}
                  onChange={(e) => setStudyYearNumber(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'ক্যালেন্ডার বর্ষ (Calendar Year) *' : 'Calendar Year *'}
              </label>
              <input
                type="number"
                required
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'শুরুর তারিখ *' : 'Start Date *'}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'শেষ তারিখ *' : 'End Date *'}
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {submitting ? '...' : isBn ? 'তৈরি করুন' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
