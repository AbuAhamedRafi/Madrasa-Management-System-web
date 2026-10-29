
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../../services/studentsApi';
import type { StudentStatus } from '../../../../types/students';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  studentId: number;
  currentStatus: StudentStatus;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const StatusChangeModal: React.FC<Props> = ({
  studentId,
  currentStatus,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const allowedOptions: Record<StudentStatus, string[]> = {
    REGISTERED: ['ACTIVE', 'WITHDRAWN', 'ARCHIVED'],
    ACTIVE: ['INACTIVE', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED', 'ARCHIVED'],
    INACTIVE: ['ACTIVE', 'WITHDRAWN', 'ARCHIVED'],
    WITHDRAWN: ['ACTIVE', 'ARCHIVED'],
    TRANSFERRED: ['ARCHIVED'],
    GRADUATED: ['ARCHIVED'],
    ARCHIVED: [],
  };

  const nextOptions = allowedOptions[currentStatus] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || !reason.trim()) {
      setError(isBn ? 'নতুন অবস্থা ও কারণ উল্লেখ করা আবশ্যক।' : 'Status and reason are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await studentsApi.updateStatus(studentId, {
        status: newStatus,
        reason: reason.trim(),
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update student status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isBn ? 'শিক্ষার্থীর অবস্থা পরিবর্তন' : 'Change Student Status'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'বর্তমান অবস্থা' : 'Current Status'}
            </label>
            <div className="px-3 py-2 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700">
              {currentStatus}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'নতুন অবস্থা নির্বাচন করুন *' : 'Select Target Status *'}
            </label>
            <select
              required
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
            >
              <option value="">{isBn ? '-- নির্বাচন করুন --' : '-- Choose status --'}</option>
              {nextOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'পরিবর্তনের কারণ (অডিট ট্রেইল) *' : 'Reason for Status Change (Audit Trail) *'}
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isBn
                  ? 'যেমন: ফি পরিশোধ সম্পন্ন হওয়ায় শিক্ষার্থী সক্রিয় করা হলো।'
                  : 'e.g. Fee settled at counter, activating student profile.'
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#137C73] text-white text-xs font-bold hover:bg-[#0f635c] disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {submitting
                  ? isBn
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : isBn
                  ? 'অবস্থা পরিবর্তন করুন'
                  : 'Update Status'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
