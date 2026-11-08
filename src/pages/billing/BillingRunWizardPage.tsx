import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Play,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import { academicsApi } from '../../services/academicsApi';
import type { BillingRun, BillingRunType } from '../../types/billing';

export const BillingRunWizardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [programId, setProgramId] = useState<number>(0);
  const [periodId, setPeriodId] = useState<number>(0);
  const [classId, setClassId] = useState<number | ''>('');
  const [runType, setRunType] = useState<BillingRunType>('MONTHLY_TUITION');
  const [billingMonth, setBillingMonth] = useState('2026-10');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [notes] = useState('');

  const [previewData, setPreviewData] = useState<any | null>(null);
  const [activeRun, setActiveRun] = useState<BillingRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const progs = await academicsApi.getPrograms({ active: true });
        setPrograms(progs);
        if (progs.length > 0) {
          setProgramId(progs[0].id);
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      }
    };
    loadPrograms();
  }, []);

  useEffect(() => {
    if (!programId) return;
    const loadScope = async () => {
      try {
        const [pds, cls] = await Promise.all([
          academicsApi.getPeriods({ program_id: programId }),
          academicsApi.getClasses(programId, true),
        ]);
        setPeriods(pds);
        setClasses(cls);
        if (pds.length > 0) setPeriodId(pds[0].id);
      } catch (err) {
        console.error('Failed to load scope', err);
      }
    };
    loadScope();
  }, [programId]);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await billingApi.previewRun({
        type: runType,
        academic_period_id: Number(periodId),
        program_class_id: classId ? Number(classId) : null,
        billing_month: runType === 'MONTHLY_TUITION' ? billingMonth : null,
        due_date: dueDate,
      });
      setPreviewData(res);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          (isBn ? 'প্রিভিউ লোড করা যায়নি' : 'Failed to preview billing run')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndExecute = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const created = await billingApi.createRun({
        type: runType,
        academic_period_id: Number(periodId),
        program_class_id: classId ? Number(classId) : null,
        billing_month: runType === 'MONTHLY_TUITION' ? billingMonth : null,
        due_date: dueDate,
        notes: notes || null,
      });
      const executed = await billingApi.executeRun(created.id, {
        issue_immediately: true,
        lock_version: created.lock_version,
      });
      setActiveRun(executed);
      setSuccessMsg(
        isBn
          ? `বিলিং রান (${executed.run_code}) সফলভাবে সম্পন্ন হয়েছে!`
          : `Billing run (${executed.run_code}) executed successfully!`
      );
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          (isBn ? 'বিলিং রান চালানো যায়নি' : 'Failed to execute billing run')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!activeRun) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const retried = await billingApi.retryFailedRunItems(activeRun.id, {
        issue_immediately: true,
        lock_version: activeRun.lock_version,
      });
      setActiveRun(retried);
      setSuccessMsg(
        isBn ? 'ব্যর্থ আইটেমগুলো পুনরায় চালানো হয়েছে' : 'Retried failed billing run items'
      );
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Link to="/app/billing" className="hover:underline flex items-center gap-1 text-teal-700">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? 'বিলিং ড্যাশবোর্ড' : 'Billing'}
            </Link>
            <span>/</span>
            <span>{isBn ? 'বিলিং রান' : 'Billing Runs'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'মাসিক ও ব্যাচ বিলিং রান' : 'Monthly & Batch Billing Run'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ডুপ্লিকেট ছাড়াই মাসভিত্তিক ইনভয়েস প্রিভিউ, যাচাই ও প্রকাশ করুন'
              : 'Preview, validate, and publish month-specific invoices without duplicates.'}
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'মোট এনরোলমেন্ট' : 'Target Enrollments'}</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {activeRun?.target_student_count ?? previewData?.target_student_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'অনুমোদিত শিক্ষাক্রম থেকে' : 'From active academic offerings'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'পূর্ববর্তী ইনভয়েস (স্কিপ)' : 'Existing Invoice Keys'}</span>
            <span className="text-teal-700 font-bold">↻</span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {activeRun?.skipped_count ?? previewData?.skipped_existing_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'দ্বিতীয়বার বিল করা হবে না' : 'Will not be billed twice'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'নতুন ইনভয়েস প্রার্থী' : 'Preview Candidate Charges'}</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {activeRun?.success_count ?? previewData?.billable_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ৳ {activeRun?.total_invoiced_amount ?? previewData?.estimated_total_amount ?? '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'সম্ভাব্য ত্রুটি / ব্লক' : 'Potential Conflicts'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {activeRun?.failed_count ?? previewData?.failed_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'প্রকাশের পূর্বে যাচাই প্রয়োজন' : 'Need review before publish'}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Run Configuration */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#182C4B]">
            {isBn ? 'রিকারিং বিলিং রান কনফিগারেশন' : 'Create Recurring Billing Run'}
          </h2>

          <form onSubmit={handlePreview} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'প্রোগ্রাম' : 'Academic Program'}
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isBn ? p.name_bn : p.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'শিক্ষাবর্ষ / পিরিয়ড' : 'Academic Period'}
                </label>
                <select
                  value={periodId}
                  onChange={(e) => setPeriodId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {periods.map((pd) => (
                    <option key={pd.id} value={pd.id}>
                      {pd.name_en || pd.label || pd.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'শ্রেণি (ঐচ্ছিক)' : 'Class / Stage (Optional)'}
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {isBn ? cl.name_bn : cl.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'রানের ধরন' : 'Run Type'}
                </label>
                <select
                  value={runType}
                  onChange={(e) => setRunType(e.target.value as BillingRunType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="MONTHLY_TUITION">MONTHLY_TUITION</option>
                  <option value="ADMISSION_BATCH">ADMISSION_BATCH</option>
                  <option value="PROMOTION_BATCH">PROMOTION_BATCH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {runType === 'MONTHLY_TUITION' && (
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {isBn ? 'বিলিং মাস (YYYY-MM)' : 'Billing Month'}
                  </label>
                  <input
                    type="month"
                    required
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'পরিশোধের শেষ তারিখ' : 'Invoice Due Date'}
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-sky-900 flex gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'প্রিভিউ শুধুমাত্র D04 এনরোলমেন্ট স্ট্যাটাস পড়ে। প্রিভিউ চলাকালীন কোনো ইনভয়েস তৈরি হয় না।'
                  : 'Preview reads the authoritative D04 enrollment state. No invoice or transaction is created during preview.'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !periodId}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border border-teal-600 text-teal-800 bg-teal-50 hover:bg-teal-100"
              >
                <Eye className="w-4 h-4" />
                {isBn ? 'প্রার্থী প্রিভিউ দেখুন' : 'Preview Candidates'}
              </button>

              <button
                type="button"
                onClick={handleCreateAndExecute}
                disabled={loading || !periodId}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
              >
                <Play className="w-4 h-4" />
                {isBn ? 'রান তৈরি ও প্রকাশ করুন' : 'Create & Execute Run'}
              </button>
            </div>
          </form>
        </section>

        {/* Right Panel: Preview / Execution Summary */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#182C4B]">
              {activeRun
                ? `${isBn ? 'রান ফলাফল:' : 'Run Outcome:'} ${activeRun.run_code}`
                : isBn
                ? 'রান প্রিভিউ সারসংক্ষেপ'
                : 'Run Preview Summary'}
            </h2>

            {activeRun && activeRun.failed_count > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isBn ? 'ব্যর্থ আইটেম পুনরায় চালান' : 'Retry Failed Items'}
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'গ্রুপ' : 'Group'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'সংখ্যা' : 'Count'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {isBn ? 'নতুন যোগ্য ইনভয়েস' : 'Eligible, new'}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {activeRun?.success_count ?? previewData?.billable_count ?? 0}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      {isBn ? 'ইনভয়েস তৈরি' : 'Create'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {isBn ? 'ইতিমধ্যে ইনভয়েসকৃত' : 'Already invoiced'}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {activeRun?.skipped_count ?? previewData?.skipped_existing_count ?? 0}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700">
                      {isBn ? 'স্কিপ (Skip)' : 'Skip'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {isBn ? 'ফি কাঠামো অনুপস্থিত / ত্রুটি' : 'Missing fee structure / Block'}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {activeRun?.failed_count ?? previewData?.failed_count ?? 0}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                      {isBn ? 'ব্লক (Block)' : 'Block'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900">
            {isBn
              ? 'প্রকাশিত বিলিং রান পুনরায় চালালে একই এনরোলমেন্ট ও বিলিং মাসের জন্য কখনোই ডুপ্লিকেট টিউশন ইনভয়েস তৈরি হবে না।'
              : 'Retrying a published run will never create duplicate tuition invoices for the same enrollment and billing month.'}
          </div>

          {/* Item Breakdown */}
          {(activeRun?.items?.length || previewData?.items?.length) > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                {isBn ? 'শিক্ষার্থী ভিত্তিক তালিকা' : 'Candidate & Item Breakdown'}
              </h3>
              <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-3">{isBn ? 'শিক্ষার্থী' : 'Student'}</th>
                      <th className="py-2 px-3">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                      <th className="py-2 px-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeRun?.items || previewData?.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2 px-3">
                          {it.student ? (
                            <span>
                              {isBn ? it.student.full_name_bn : it.student.full_name_en} (
                              {it.student.student_id})
                            </span>
                          ) : (
                            <span>
                              {isBn ? it.student_name_bn : it.student_name_en} ({it.student_code})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold">
                          ৳ {it.expected_amount}
                        </td>
                        <td className="py-2 px-3">
                          {it.invoice_id ? (
                            <Link
                              to={`/app/billing/invoices/${it.invoice_id}`}
                              className="text-teal-700 font-bold hover:underline"
                            >
                              {it.status} → #{it.invoice_id}
                            </Link>
                          ) : (
                            <span className="text-slate-600">
                              {it.status} {it.failure_code ? `(${it.failure_code})` : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
