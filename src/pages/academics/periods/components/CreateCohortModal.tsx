import React, { useState } from 'react';
import { academicsApi } from '../../../../services/academicsApi';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  programId: number;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateCohortModal: React.FC<Props> = ({
  isOpen,
  programId,
  onClose,
  onCreated,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [label, setLabel] = useState('2026-27');
  const [intakeYear, setIntakeYear] = useState(2026);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await academicsApi.createCohort({
        program_id: programId,
        label,
        intake_year: Number(intakeYear),
        status: 'DRAFT',
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create cohort.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isBn ? 'নতুন ভর্তি সেশন / ব্যাচ তৈরি করুন' : 'Create Admission Cohort'}
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
              {isBn ? 'সেশন লেবেল (যেমন: 2026-27) *' : 'Cohort Label (e.g. 2026-27) *'}
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'ভর্তি বর্ষ (Intake Year) *' : 'Intake Year *'}
            </label>
            <input
              type="number"
              required
              value={intakeYear}
              onChange={(e) => setIntakeYear(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
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
