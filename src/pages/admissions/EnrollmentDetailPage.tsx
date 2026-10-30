import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { Enrollment, SectionCapacity } from '../../types/admissions';
import { AdmissionStatusChip } from '../../components/admissions/AdmissionStatusChip';
import { CapacityMeter } from '../../components/admissions/CapacityMeter';
import { StudentHandoffCard } from '../../components/admissions/StudentHandoffCard';
import { ReallocateSectionModal } from '../../components/admissions/ReallocateSectionModal';
import { CancelRejectModal } from '../../components/admissions/CancelRejectModal';
import {
  ArrowLeft,
  ArrowRightLeft,
  XCircle,
  AlertTriangle,
  History,
  User,
  GraduationCap,
} from 'lucide-react';

export const EnrollmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [data, setData] = useState<{
    enrollment: Enrollment;
    section_capacity: SectionCapacity;
    handoff: any;
  } | null>(null);

  const [reallocateOpen, setReallocateOpen] = useState<boolean>(false);
  const [cancelModalMode, setCancelModalMode] = useState<'CANCEL' | 'REJECT' | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await admissionsApi.getEnrollment(Number(id));
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load enrollment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollment();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        {isBn ? 'এনরোলমেন্ট তথ্য লোড হচ্ছে...' : 'Loading enrollment details...'}
      </div>
    );
  }

  if (!data?.enrollment) {
    return (
      <div className="p-12 text-center text-xs text-rose-500">
        {error || (isBn ? 'এনরোলমেন্ট পাওয়া যায়নি।' : 'Enrollment record not found.')}
      </div>
    );
  }

  const { enrollment, section_capacity } = data;
  const isTerminal =
    enrollment.status === 'APPROVED' ||
    enrollment.status === 'REJECTED' ||
    enrollment.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app/admissions"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                {isBn ? enrollment.student?.name_bn : enrollment.student?.name_en}
              </h1>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {enrollment.student?.student_id}
              </span>
              <AdmissionStatusChip status={enrollment.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn
                ? `ভর্তি আবেদন #${enrollment.id} · জমার তারিখ: ${new Date(enrollment.submitted_at).toLocaleDateString('bn-BD')}`
                : `Enrollment #${enrollment.id} · Submitted: ${new Date(enrollment.submitted_at).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isTerminal && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReallocateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
              <span>{isBn ? 'শাখা পরিবর্তন' : 'Reallocate'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCancelModalMode('CANCEL')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCancelModalMode('REJECT')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBn ? 'প্রত্যাখ্যান' : 'Reject'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Handoff Status Card */}
      <StudentHandoffCard enrollment={enrollment} />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student & Guardian Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-teal-600" />
            <span>{isBn ? 'শিক্ষার্থী ও অভিভাবকের তথ্য' : 'Student Profile & Guardian'}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'নাম (বাংলা):' : 'Name (Bangla):'}</span>
              <span className="font-semibold text-slate-900">{enrollment.student?.name_bn}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'Name (English):' : 'Name (English):'}</span>
              <span className="font-semibold text-slate-900">{enrollment.student?.name_en}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'লিঙ্গ:' : 'Gender:'}</span>
              <span className="font-semibold text-slate-900">
                {enrollment.student?.gender === 'MALE'
                  ? isBn ? 'ছাত্র' : 'Male'
                  : isBn ? 'ছাত্রী' : 'Female'}
              </span>
            </div>

            {enrollment.student?.primary_guardian && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                <div className="font-bold text-slate-800">
                  {isBn ? 'প্রধান অভিভাবক' : 'Primary Guardian'}:{' '}
                  {isBn
                    ? enrollment.student.primary_guardian.name_bn
                    : enrollment.student.primary_guardian.name_en}
                </div>
                <div className="text-slate-600">
                  {isBn ? 'মোবাইল:' : 'Phone:'}{' '}
                  <span className="font-mono">{enrollment.student.primary_guardian.phone}</span>
                </div>
                <div className="text-slate-500">
                  {isBn ? 'সম্পর্ক:' : 'Relation:'} {enrollment.student.primary_guardian.relation}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Academic Placement & Capacity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>{isBn ? 'একাডেমিক বরাদ্দ ও শাখা' : 'Academic Placement & Section'}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'প্রোগ্রাম:' : 'Program:'}</span>
              <span className="font-bold text-slate-900">
                {isBn ? enrollment.period?.program?.name_bn : enrollment.period?.program?.name_en} (
                {enrollment.period?.program?.code})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'শিক্ষাবর্ষ:' : 'Period:'}</span>
              <span className="font-semibold text-slate-900">{enrollment.period?.label}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'শ্রেণি:' : 'Class:'}</span>
              <span className="font-semibold text-slate-900">
                {isBn
                  ? enrollment.offering?.program_class?.name_bn
                  : enrollment.offering?.program_class?.name_en}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'নির্ধারিত শাখা:' : 'Assigned Section:'}</span>
              <span className="font-bold text-teal-700">
                {isBn ? enrollment.section?.name_bn : enrollment.section?.name_en} (
                {enrollment.section?.code})
              </span>
            </div>

            {section_capacity && (
              <div className="pt-2">
                <CapacityMeter capacity={section_capacity} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Status Audit Events */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-teal-600" />
          <span>{isBn ? 'লাইফসাইকেল অডিট ট্রেইল ও ইতিহাস' : 'Lifecycle Status Audit Trail'}</span>
        </div>

        {enrollment.status_events && enrollment.status_events.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {enrollment.status_events.map((ev) => (
              <div key={ev.id} className="relative text-xs">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {ev.from_status} → {ev.to_status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {ev.source_type}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(ev.occurred_at).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
                {ev.reason && (
                  <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {ev.reason}
                  </p>
                )}
                {ev.actor && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isBn ? 'সম্পাদনকারী:' : 'By:'}{' '}
                    <strong>{isBn ? ev.actor.name_bn : ev.actor.name_en}</strong> (
                    {ev.actor.username})
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-3 text-center">
            {isBn ? 'কোনো স্ট্যাটাস ইভেন্ট পাওয়া যায়নি।' : 'No status events recorded.'}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReallocateSectionModal
        enrollment={reallocateOpen ? enrollment : null}
        onClose={() => setReallocateOpen(false)}
        onSuccess={loadEnrollment}
      />

      <CancelRejectModal
        enrollment={cancelModalMode ? enrollment : null}
        mode={cancelModalMode || 'CANCEL'}
        onClose={() => setCancelModalMode(null)}
        onSuccess={loadEnrollment}
      />
    </div>
  );
};
