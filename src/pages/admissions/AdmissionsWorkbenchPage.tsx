import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import { academicsApi } from '../../services/academicsApi';
import type { Enrollment, AdmissionsWorkbenchMeta } from '../../types/admissions';
import type { AcademicProgram } from '../../types/academics';
import { AdmissionStatusChip } from '../../components/admissions/AdmissionStatusChip';
import {
  Users,
  Search,
  Plus,
  RotateCcw,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AdmissionsWorkbenchPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const [searchParams, setSearchParams] = useSearchParams();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [meta, setMeta] = useState<AdmissionsWorkbenchMeta | null>(null);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const programId = searchParams.get('program_id') || '';
  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page') || '1');

  useEffect(() => {
    academicsApi.getPrograms().then(setPrograms).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await admissionsApi.getWorkbench({
        page,
        per_page: 15,
        search: search || undefined,
        program_id: programId ? Number(programId) : undefined,
        status: status || undefined,
      });
      setEnrollments(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load admissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, programId, status]);

  const handleSearchChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('search', val);
    else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleProgramChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('program_id', val);
    else next.delete('program_id');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleStatusChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('status', val);
    else next.delete('status');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-700" />
            {isBn ? 'ভর্তি ও এনরোলমেন্ট ওয়ার্কবেঞ্চ' : 'Admissions & Enrollment Workbench'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'শিক্ষার্থীদের প্রোগ্রাম ভর্তি, শাখা নির্ধারণ, ধারণক্ষমতা পর্যবেক্ষণ ও অগ্রগতি ব্যবস্থাপনা'
              : 'Manage student program admissions, section assignments, capacity tracking, and progressions'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/admissions/new/student"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? '+ নতুন শিক্ষার্থী ভর্তি' : '+ New Admission'}</span>
          </Link>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isBn ? 'মোট আবেদন' : 'Total Enrollments'}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {meta?.counts.total ?? 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              {isBn ? 'বিলিং অপেক্ষমাণ' : 'Pending Billing'}
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {meta?.counts.pending_billing ?? 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
              {isBn ? 'পেমেন্ট অপেক্ষমাণ' : 'Pending Payment'}
            </div>
            <div className="text-2xl font-bold text-indigo-900 mt-1">
              {meta?.counts.pending_payment ?? 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {isBn ? 'অনুমোদিত ও সক্রিয়' : 'Approved & Active'}
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {meta?.counts.approved ?? 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isBn ? 'নাম বা শিক্ষার্থী আইডি খুঁজুন...' : 'Search student or ID...'}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <select
            value={programId}
            onChange={(e) => handleProgramChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="">{isBn ? '-- সকল প্রোগ্রাম --' : '-- All Programs --'}</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {isBn ? p.name_bn : p.name_en} ({p.code})
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="">{isBn ? '-- সকল অবস্থা --' : '-- All Statuses --'}</option>
            <option value="PENDING_BILLING">{isBn ? 'বিলিং অপেক্ষমাণ' : 'Pending Billing'}</option>
            <option value="PENDING_PAYMENT">{isBn ? 'পেমেন্ট অপেক্ষমাণ' : 'Pending Payment'}</option>
            <option value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</option>
            <option value="CANCELLED">{isBn ? 'বাতিলকৃত' : 'Cancelled'}</option>
            <option value="REJECTED">{isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}</option>
          </select>

          {(search || programId || status) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'ফিল্টার রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading enrollments...'}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {isBn ? 'কোনো ভর্তি আবেদন পাওয়া যায়নি।' : 'No admission records found matching filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'শিক্ষার্থী' : 'Student'}</th>
                  <th className="py-3 px-4">{isBn ? 'প্রোগ্রাম ও শ্রেণি' : 'Program & Class'}</th>
                  <th className="py-3 px-4">{isBn ? 'শিক্ষাবর্ষ ও শাখা' : 'Period & Section'}</th>
                  <th className="py-3 px-4">{isBn ? 'ধরন' : 'Type'}</th>
                  <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3 px-4">{isBn ? 'আবেদনের তারিখ' : 'Submitted Date'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {isBn ? e.student?.name_bn : e.student?.name_en}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {e.student?.student_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {isBn
                          ? e.offering?.program_class?.name_bn
                          : e.offering?.program_class?.name_en}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isBn ? e.period?.program?.name_bn : e.period?.program?.name_en} (
                        {e.period?.program?.code})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{e.period?.label}</div>
                      <div className="text-[11px] font-medium text-teal-700">
                        {isBn ? e.section?.name_bn : e.section?.name_en} ({e.section?.code})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {e.enrollment_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <AdmissionStatusChip status={e.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(e.submitted_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/app/enrollments/${e.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-teal-700 hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                      >
                        <span>{isBn ? 'বিস্তারিত' : 'View'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              {isBn
                ? `পৃষ্ঠা ${meta.current_page} এর ${meta.last_page} (মোট ${meta.total})`
                : `Page ${meta.current_page} of ${meta.last_page} (${meta.total} records)`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(meta.current_page - 1));
                  setSearchParams(next);
                }}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(meta.current_page + 1));
                  setSearchParams(next);
                }}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
