import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { Enrollment, SectionCapacity } from '../../types/admissions';
import { CapacityMeter } from './CapacityMeter';
import { X, ArrowRightLeft } from 'lucide-react';

interface Props {
  enrollment: Enrollment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReallocateSectionModal: React.FC<Props> = ({ enrollment, onClose, onSuccess }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [sections, setSections] = useState<SectionCapacity[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollment) return;
    setLoading(true);
    admissionsApi
      .getAlternativeSections(enrollment.academic_offering_id)
      .then((data) => {
        setSections(data);
        const firstAvailable = data.find(
          (s) => s.section_id !== enrollment.offering_section_id && !s.is_full
        );
        if (firstAvailable) {
          setSelectedSectionId(firstAvailable.section_id);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || 'Failed to load sections.');
      })
      .finally(() => setLoading(false));
  }, [enrollment]);

  if (!enrollment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !reason.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await admissionsApi.reallocateSection(enrollment.id, {
        new_section_id: Number(selectedSectionId),
        reason: reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to reallocate section.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">
              {isBn ? 'শিক্ষার্থীর শাখা (Section) পরিবর্তন' : 'Reallocate Student Section'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-900">
              {isBn ? enrollment.student?.name_bn : enrollment.student?.name_en} ({enrollment.student?.student_id})
            </div>
            <div className="text-slate-500">
              {isBn ? 'বর্তমান শাখা:' : 'Current Section:'}{' '}
              <span className="font-bold text-teal-700">
                {isBn ? enrollment.section?.name_bn : enrollment.section?.name_en} ({enrollment.section?.code})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {isBn ? 'নতুন শাখা নির্বাচন করুন *' : 'Select Target Section *'}
            </label>

            {loading ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                {isBn ? 'শাখাগুলোর তথ্য লোড হচ্ছে...' : 'Loading sections...'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sections.map((sec) => {
                  const isCurrent = sec.section_id === enrollment.offering_section_id;
                  const isSelected = selectedSectionId === sec.section_id;

                  return (
                    <div
                      key={sec.section_id}
                      onClick={() => !isCurrent && !sec.is_full && setSelectedSectionId(sec.section_id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                          : sec.is_full
                          ? 'opacity-60 cursor-not-allowed bg-rose-50/30 border-rose-200'
                          : isSelected
                          ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CapacityMeter capacity={sec} />
                      {isCurrent && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {isBn ? '(বর্তমান শাখা)' : '(Current section)'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'পরিবর্তনের কারণ (অডিট ট্রেইল) *' : 'Reason for Reallocation (Audit Trail) *'}
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isBn
                  ? 'যেমন: শিক্ষার্থীর অনুরোধে বা ক্লাস ভারসাম্য রক্ষার্থে শাখা পরিবর্তন...'
                  : 'E.g. Student request or balancing section strength...'
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSectionId || !reason.trim()}
              className="px-5 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
                : isBn ? 'শাখা পরিবর্তন কার্যকর করুন' : 'Confirm Reallocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
