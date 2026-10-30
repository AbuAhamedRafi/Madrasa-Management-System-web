import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { Enrollment } from '../../types/admissions';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  enrollment: Enrollment | null;
  mode: 'CANCEL' | 'REJECT';
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelRejectModal: React.FC<Props> = ({ enrollment, mode, onClose, onSuccess }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!enrollment) return null;

  const isCancel = mode === 'CANCEL';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      if (isCancel) {
        await admissionsApi.cancelEnrollment(enrollment.id, reason.trim());
      } else {
        await admissionsApi.rejectEnrollment(enrollment.id, reason.trim());
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isCancel ? 'text-amber-600' : 'text-rose-600'}`} />
            <h3 className="font-bold text-slate-900 text-base">
              {isCancel
                ? isBn ? 'এনরোলমেন্ট বাতিলকরণ' : 'Cancel Enrollment'
                : isBn ? 'ভর্তি আবেদন প্রত্যাখ্যান' : 'Reject Admission Application'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            {isCancel
              ? isBn
                ? 'এনরোলমেন্ট বাতিল করলে বরাদ্দকৃত আসনটি অবিলম্বে উন্মুক্ত হবে এবং অন্য শিক্ষার্থীর জন্য বরাদ্দযোগ্য হবে।'
                : 'Cancelling this enrollment will immediately release the reserved seat for other students.'
              : isBn
                ? 'ভর্তি আবেদন প্রত্যাখ্যান করলে আবেদনটি স্থায়ীভাবে বাতিল হবে।'
                : 'Rejecting this admission application will mark it as terminal and non-enrolled.'}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'পদক্ষেপের কারণ (বাধ্যতামূলক) *' : 'Reason for Action (Mandatory) *'}
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isBn
                  ? 'অডিট ট্রেইলের জন্য স্পষ্ট কারণ লিখুন...'
                  : 'Provide clear justification for the audit trail...'
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isBn ? 'ফিরে যান' : 'Go Back'}
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 cursor-pointer ${
                isCancel ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting
                ? isBn ? 'প্রক্রিয়াধীন...' : 'Processing...'
                : isCancel
                ? isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancellation'
                : isBn ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
