import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { SessionProgressionContext, SectionCapacity } from '../../types/admissions';
import { CapacityMeter } from '../../components/admissions/CapacityMeter';
import {
  CalendarRange,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

export const SessionCohortProgressionPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();

  const [context, setContext] = useState<SessionProgressionContext | null>(null);
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
      .getSessionProgression(Number(studentId))
      .then((data) => {
        setContext(data);
        if (data.next_period && data.next_period.offerings && data.next_period.offerings.length > 0) {
          const firstOff = data.next_period.offerings[0];
          setSelectedOfferingId(firstOff.id);
          if (firstOff.sections && firstOff.sections.length > 0) {
            setSelectedSectionId(firstOff.sections[0].id);
          }
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || 'Failed to load session progression.');
      })
      .finally(() => setLoading(false));
  }, [studentId]);

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
    if (!context?.next_period || !selectedSectionId) {
      setError(isBn ? 'অনুগ্রহ করে শাখা নির্বাচন করুন।' : 'Please choose a section.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const enrollment = await admissionsApi.createSessionProgression({
        student_record_id: Number(studentId),
        academic_program_id: context.program.id,
        academic_cohort_id: context.cohort.id,
        academic_period_id: context.next_period.id,
        offering_section_id: Number(selectedSectionId),
        notes: notes.trim() || undefined,
      });

      navigate(`/app/enrollments/${enrollment.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit session progression.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        {isBn ? 'সেশন তথ্য লোড হচ্ছে...' : 'Loading session cohort data...'}
      </div>
    );
  }

  if (!context?.has_session_program) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">
          {isBn ? 'কোনো সেশন ভিত্তিক কোহর্ট নেই' : 'No Active Session Program'}
        </h3>
        <p className="text-xs text-slate-600">
          {isBn
            ? 'এই শিক্ষার্থীর কোনো সক্রিয় আলিম বা ফাজিল সেশন ভিত্তিক ভর্তি পাওয়া যায়নি।'
            : 'This student does not have an active session-based cohort admission.'}
        </p>
        <Link
          to="/app/admissions/new/student"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'শিক্ষার্থী তালিকায় ফিরে যান' : 'Back to Students'}</span>
        </Link>
      </div>
    );
  }

  const nextPeriod = context.next_period;
  const availableOfferings = nextPeriod?.offerings || [];
  const activeOffering = availableOfferings.find((o: any) => o.id === Number(selectedOfferingId));
  const availableSections = activeOffering?.sections || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-indigo-700" />
            {isBn ? 'সেশন কোহর্ট শিক্ষাবর্ষ অগ্রগতি' : 'Session Cohort Progression Timeline'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'মাল্টি-ইয়ার কোহর্ট (আলিম/ফাজিল) এর বর্ষভিত্তিক অগ্রগতি ও সেমিস্টার নির্বাচন'
              : 'Track multi-year study stages and enroll into the next cohort year'}
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

      {/* Cohort Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{isBn ? 'শিক্ষার্থী:' : 'Student:'}</div>
          <div className="font-bold text-slate-900 text-sm">
            {isBn ? context.student.name_bn : context.student.name_en} ({context.student.student_id})
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">{isBn ? 'প্রোগ্রাম:' : 'Program:'}</div>
          <div className="font-bold text-slate-900 text-sm">
            {isBn ? context.program?.name_bn : context.program?.name_en}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">{isBn ? 'কোহর্ট ব্যাচ:' : 'Cohort Batch:'}</div>
          <div className="font-bold text-indigo-700 text-sm">{context.cohort?.label}</div>
        </div>
      </div>

      {/* Timeline Progression Cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {isBn ? 'কোহর্ট শিক্ষাবর্ষ পরিক্রমা' : 'Cohort Study Stages'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {context.periods_timeline?.map((pd: any) => {
            const isEnrolled = context.past_enrollments?.some((e) => e.academic_period_id === pd.id);
            const isNext = nextPeriod?.id === pd.id;

            return (
              <div
                key={pd.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEnrolled
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : isNext
                    ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold uppercase tracking-wider">
                    {isBn ? `বর্ষ #${pd.study_year_number}` : `Year #${pd.study_year_number}`}
                  </span>
                  {isEnrolled ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isBn ? 'সম্পন্ন' : 'Enrolled'}
                    </span>
                  ) : isNext ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      {isBn ? 'পরবর্তী ধাপ' : 'Next Stage'}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">{isBn ? 'আসন্ন' : 'Future'}</span>
                  )}
                </div>

                <div className="font-semibold text-slate-900 text-xs">{pd.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {new Date(pd.start_date).getFullYear()} - {new Date(pd.end_date).getFullYear()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Period Enrollment Form */}
      {nextPeriod ? (
        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
            <GraduationCap className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              {isBn ? `পরবর্তী বর্ষের ভর্তি: ${nextPeriod.label}` : `Enroll into Next Year: ${nextPeriod.label}`}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'শ্রেণি / বিষয়বস্তু *' : 'Class Offering *'}
              </label>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              >
                {availableOfferings.map((off: any) => (
                  <option key={off.id} value={off.id}>
                    {isBn ? off.program_class?.name_bn : off.program_class?.name_en}
                  </option>
                ))}
              </select>
            </div>

            {selectedOfferingId && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'শাখা (Section) *' : 'Section *'}
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                >
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
                {isBn ? 'অগ্রগতি সংক্রান্ত মন্তব্য (ঐচ্ছিক)' : 'Progression Notes (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isBn ? 'সেশন পদোন্নতির মন্তব্য...' : 'Notes on session advancement...'}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedSectionId || sectionCapacity?.is_full}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? (
                  <span>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isBn ? 'পরবর্তী বর্ষে এনরোলমেন্ট জমা দিন' : 'Submit Session Progression'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-emerald-900 text-sm">
            {isBn ? 'সকল শিক্ষাবর্ষ সম্পন্ন হয়েছে' : 'All Cohort Stages Completed'}
          </h3>
          <p className="text-xs text-emerald-700">
            {isBn
              ? 'এই শিক্ষার্থী তার বর্তমান কোহর্টের সকল নির্ধারিত শিক্ষাবর্ষে এনরোল সম্পন্ন করেছে।'
              : 'The student has enrolled in all available periods within this session cohort.'}
          </p>
        </div>
      )}
    </div>
  );
};
