import React, { useState } from 'react';
import type { AcademicPeriod, PeriodState } from '../../../../types/academics';
import { useTranslation } from 'react-i18next';
import { Lock, Unlock, PlayCircle } from 'lucide-react';

interface Props {
  period: AcademicPeriod;
  canClosePeriods: boolean;
  onTransition: (targetState: PeriodState, reason: string) => Promise<void>;
}

export const PeriodLifecycleConfirmCard: React.FC<Props> = ({
  period,
  canClosePeriods,
  onTransition,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!canClosePeriods) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-500">
        {isBn
          ? 'শিক্ষাবর্ষের অবস্থা পরিবর্তন করার অনুমতি আপনার নেই (academics.close_periods প্রয়োজন)।'
          : 'You do not have permission to change study period lifecycle states (requires academics.close_periods).'}
      </div>
    );
  }

  const handleAction = async (targetState: PeriodState) => {
    try {
      setSubmitting(true);
      await onTransition(targetState, reason);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {isBn
            ? 'শিক্ষাবর্ষ লাইফসাইকেল নিয়ন্ত্রণ (অ্যাক্টিভেট / ক্লোজ / রিওপেন)'
            : 'Period Lifecycle Control (Open / Close / Reopen)'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'শিক্ষাবর্ষ বন্ধ (Close) বা পুনরায় চালু (Reopen) করার জন্য সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক'
            : 'Closing or reopening an academic study period requires a mandatory audit reason'}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {isBn ? 'অডিট কারণ / মন্তব্য (Reason)' : 'Audit Reason / Note'}
          {(period.state === 'OPEN' || period.state === 'CLOSED') && ' *'}
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            isBn
              ? 'বার্ষিক পরীক্ষা ও ফলাফল সম্পন্ন হওয়ায় শিক্ষাবর্ষটি বন্ধ করা হলো...'
              : 'Enter the official reason for closing or reopening this academic period...'
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {period.state === 'DRAFT' && (
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleAction('OPEN')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            {isBn ? 'শিক্ষাবর্ষ চালু করুন (Open Period)' : 'Open Study Period'}
          </button>
        )}

        {period.state === 'OPEN' && (
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleAction('CLOSED')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {isBn ? 'শিক্ষাবর্ষ বন্ধ করুন (Close Period)' : 'Close Study Period'}
          </button>
        )}

        {period.state === 'CLOSED' && (
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleAction('OPEN')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" />
            {isBn ? 'পুনরায় চালু করুন (Reopen Period)' : 'Reopen Study Period'}
          </button>
        )}
      </div>
    </div>
  );
};

