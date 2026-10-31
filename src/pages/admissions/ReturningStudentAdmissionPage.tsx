import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { ReturningContext, SectionCapacity } from '../../types/admissions';
import { CapacityMeter } from '../../components/admissions/CapacityMeter';
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  CalendarRange,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';

export const ReturningStudentAdmissionPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();

  const [context, setContext] = useState<ReturningContext | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('');
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [sectionCapacity, setSectionCapacity] = useState<SectionCapacity | null>(null);
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    admissionsApi
      .getReturningContext(Number(studentId))
      .then((data) => {
        setContext(data);
        if (data.available_periods && data.available_periods.length > 0) {
          setSelectedPeriodId(data.available_periods[0].id);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || 'Failed to load returning context.');
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const activePeriod = context?.available_periods?.find((p: any) => p.id === Number(selectedPeriodId));
  const availableOfferings = activePeriod?.offerings || [];
  const activeOffering = availableOfferings.find((o: any) => o.id === Number(selectedOfferingId));
  const availableSections = activeOffering?.sections || [];

  // Auto-select offering that matches suggested stage
  useEffect(() => {
    if (!context || !availableOfferings.length) return;
    const match = availableOfferings.find(
      (o: any) => o.program_class?.stage_number === context.suggested_next_stage
    );
    if (match) {
      setSelectedOfferingId(match.id);
      if (match.sections && match.sections.length > 0) {
        setSelectedSectionId(match.sections[0].id);
      }
    }
  }, [selectedPeriodId, context]);

  // Check section capacity
  useEffect(() => {
    if (!selectedSectionId) {
      setSectionCapacity(null);
      return;
    }
    admissionsApi
      .getSectionCapacity(Number(selectedSectionId))
      .then(setSectionCapacity)
      .catch(console.error);
  }, [selectedSectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId || !selectedSectionId) {
      setError(isBn ? 'অনুগ্রহ করে শিক্ষাবর্ষ ও শাখা নির্বাচন করুন।' : 'Please choose study period and section.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const enrollment = await admissionsApi.createReturningEnrollment({
        student_record_id: Number(studentId),
        academic_program_id: context?.program?.id,
        academic_period_id: Number(selectedPeriodId),
        offering_section_id: Number(selectedSectionId),
        notes: notes.trim() || undefined,
      });

      navigate(`/app/enrollments/${enrollment.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit re-admission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading returning student data...'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-teal-700" />
            {isBn ? 'পুনঃভর্তি ও শিক্ষাবর্ষ পরিবর্তন' : 'Returning Student Re-Admission'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'পূর্ববর্তী শিক্ষাবর্ষের ফলাফলের ভিত্তিতে পরবর্তী শ্রেণির শাখা ও শিক্ষাবর্ষ বরাদ্দ'
              : 'Enroll continuing student into next period and study stage'}
          </p>
        </div>

        <Link
          to="/app/admissions/new/student"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'শিক্ষার্থী তালিকা' : 'Student List'}</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Previous Placement */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>{isBn ? 'পূর্ববর্তী শিক্ষাবর্ষের রেকর্ড' : 'Previous Period Record'}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">{isBn ? 'শিক্ষার্থী:' : 'Student:'}</span>
              <span className="font-semibold text-slate-900 text-sm">
                {isBn ? context?.student.name_bn : context?.student.name_en} ({context?.student.student_id})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'প্রোগ্রাম:' : 'Program:'}</span>
                <span className="font-semibold text-slate-900">
                  {isBn ? context?.program?.name_bn : context?.program?.name_en}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'অধ্যয়নকৃত শ্রেণি:' : 'Completed Class:'}</span>
                <span className="font-semibold text-slate-900">
                  {isBn
                    ? context?.previous_enrollment?.offering?.program_class?.name_bn
                    : context?.previous_enrollment?.offering?.program_class?.name_en}{' '}
                  (স্তর #{context?.current_stage})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'শিক্ষাবর্ষ:' : 'Period:'}</span>
                <span className="font-semibold text-slate-900">
                  {context?.previous_enrollment?.period?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'শাখা:' : 'Section:'}</span>
                <span className="font-semibold text-slate-900">
                  {context?.previous_enrollment?.section?.code}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Proposed Next Placement */}
        <div className="bg-white rounded-xl border border-teal-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b border-teal-100 pb-3">
            <CalendarRange className="w-4 h-4 text-teal-600" />
            <span>{isBn ? 'প্রস্তাবিত পরবর্তী শিক্ষাবর্ষ বরাদ্দ' : 'Proposed Next Period Placement'}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'পরবর্তী শিক্ষাবর্ষ *' : 'Target Study Period *'}
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              >
                {context?.available_periods?.map((pd: any) => (
                  <option key={pd.id} value={pd.id}>
                    {pd.label} ({pd.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'পরবর্তী শ্রেণি ও গ্রুপ *' : 'Next Class & Track *'}
              </label>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              >
                <option value="">{isBn ? '-- শ্রেণি নির্বাচন --' : '-- Choose Class --'}</option>
                {availableOfferings.map((off: any) => (
                  <option key={off.id} value={off.id}>
                    {isBn ? off.program_class?.name_bn : off.program_class?.name_en}
                    {off.program_class?.stage_number === context?.suggested_next_stage ? ' (প্রস্তাবিত)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedOfferingId && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'নতুন শাখা *' : 'Target Section *'}
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                >
                  <option value="">{isBn ? '-- শাখা নির্বাচন --' : '-- Choose Section --'}</option>
                  {availableSections.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {isBn ? sec.name_bn : sec.name_en} ({sec.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sectionCapacity && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <CapacityMeter capacity={sectionCapacity} />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'মন্তব্য (ঐচ্ছিক)' : 'Notes (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isBn ? 'বার্ষিক ফলাফল বা পদোন্নতি সংক্রান্ত মন্তব্য...' : 'Progression notes...'}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedPeriodId || !selectedSectionId || sectionCapacity?.is_full}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? (
                  <span>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isBn ? 'পুনঃভর্তি আবেদন নিশ্চিত করুন' : 'Confirm Re-Admission'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
