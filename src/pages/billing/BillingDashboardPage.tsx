import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Clock,
  FileSpreadsheet,
  ShieldAlert,
  PlusCircle,
  PlayCircle,
  Tag,
  ArrowRight,
  Eye,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { BillingDashboardSummary, FeeStructure } from '../../types/billing';

export const BillingDashboardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const [summary, setSummary] = useState<BillingDashboardSummary | null>(null);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, structRes] = await Promise.all([
        billingApi.getSummary(),
        billingApi.listStructures({ per_page: 5 }),
      ]);
      setSummary(sumData);
      setStructures(structRes.data || []);
    } catch (err) {
      console.error('Failed to load billing summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRunStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isBn ? 'সম্পন্ন' : 'Completed'}
          </span>
        );
      case 'PARTIALLY_FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            {isBn ? 'আংশিক ব্যর্থ' : 'Partially Failed'}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            {isBn ? 'বাতিল' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {status}
          </span>
        );
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isBn ? 'ইস্যুকৃত' : 'Issued'}
          </span>
        );
      case 'VOIDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            {isBn ? 'বাতিলকৃত' : 'Voided'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {isBn ? 'খসড়া' : 'Draft'}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">
            MMS / {isBn ? 'বিলিং ও ফি' : 'Billing'} / {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'বিলিং ও ফি ব্যবস্থাপনা' : 'Billing & Fee Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ফি কাঠামো, ইনভয়েস, মাসিক বিলিং রান ও ছাড় অনুমোদন পর্যবেক্ষণ'
              : 'Monitor fee structures, invoices, recurring billing runs, and adjustment approvals'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/app/billing/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Tag className="w-4 h-4 text-teal-600" />
            {isBn ? 'ফি খাতসমূহ' : 'Fee Categories'}
          </Link>
          <Link
            to="/app/billing/fee-structures/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100"
          >
            <PlusCircle className="w-4 h-4" />
            {isBn ? 'ফি কাঠামো তৈরি' : 'New Fee Structure'}
          </Link>
          <Link
            to="/app/billing/runs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
          >
            <PlayCircle className="w-4 h-4" />
            {isBn ? 'মাসিক বিলিং রান' : 'Monthly Billing Run'}
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{isBn ? 'চলতি মাসের ইনভয়েস' : 'Issued This Month'}</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              ৳
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            ৳ {summary?.kpis.issued_this_month_amount ?? '0.00'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary?.kpis.issued_this_month_count ?? 0}{' '}
            {isBn ? 'টি ইস্যুকৃত ইনভয়েস' : 'issued invoices'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{isBn ? 'ভর্তি ইনভয়েস অপেক্ষমান' : 'Pending Admission Invoices'}</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {summary?.kpis.pending_admission_invoices_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'ভর্তির নতুন এনরোলমেন্ট (D04)' : 'From D04 admission handoff'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{isBn ? 'ছাড় / মওকুফ অপেক্ষমান' : 'Pending Waiver Requests'}</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {summary?.kpis.pending_adjustment_requests_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'প্রশাসনিক অনুমোদন প্রয়োজন' : 'Awaiting administrative review'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{isBn ? 'প্রকাশিত ফি কাঠামো' : 'Published Fee Structures'}</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            {summary?.kpis.published_fee_structures_count ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary?.kpis.draft_invoices_count ?? 0} {isBn ? 'টি খসড়া ইনভয়েস' : 'draft invoices'}
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Runs & Recent Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Billing Runs */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#182C4B]">
                {isBn ? 'সাম্প্রতিক বিলিং রান' : 'Recent Billing Runs'}
              </h2>
              <Link
                to="/app/billing/runs/new"
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                {isBn ? 'নতুন বিলিং রান' : 'New Billing Run'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500 py-6 text-center">
                {isBn ? 'লোড হচ্ছে...' : 'Loading billing runs...'}
              </div>
            ) : !summary?.recent_runs.length ? (
              <div className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
                {isBn ? 'কোনো বিলিং রান পাওয়া যায়নি' : 'No billing runs recorded yet'}
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'রান নম্বর' : 'Run Code'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'ধরন' : 'Type'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'মাস / শিক্ষাবর্ষ' : 'Period / Month'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'সফল / মোট' : 'Processed'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'মোট পরিমাণ' : 'Total Billed'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.recent_runs.map((run) => (
                      <tr key={run.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {run.run_code}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{run.type}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {run.billing_month
                            ? run.billing_month.slice(0, 7)
                            : isBn
                            ? run.period?.name_bn || run.period?.code
                            : run.period?.name_en || run.period?.code}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {run.success_count} / {run.target_student_count}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          ৳ {run.total_invoiced_amount}
                        </td>
                        <td className="py-2.5 px-3">{getRunStatusBadge(run.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent Invoices */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#182C4B]">
                {isBn ? 'সাম্প্রতিক ইনভয়েসসমূহ' : 'Recent Invoices'}
              </h2>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500 py-6 text-center">
                {isBn ? 'লোড হচ্ছে...' : 'Loading recent invoices...'}
              </div>
            ) : !summary?.recent_invoices.length ? (
              <div className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
                {isBn ? 'কোনো ইনভয়েস পাওয়া যায়নি' : 'No invoices generated yet'}
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'ইনভয়েস নম্বর' : 'Invoice #'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'শিক্ষার্থী' : 'Student'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'উৎস' : 'Source'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'নিট দেয়' : 'Net Payable'}</th>
                      <th className="py-2.5 px-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="py-2.5 px-3 font-semibold text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.recent_invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-semibold text-teal-800">
                          <Link to={`/app/billing/invoices/${inv.id}`} className="hover:underline">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3">
                          {inv.student ? (
                            <Link
                              to={`/app/students/${inv.student.id}/billing-ledger`}
                              className="hover:underline font-medium text-slate-800"
                            >
                              {isBn ? inv.student.full_name_bn : inv.student.full_name_en}{' '}
                              <span className="text-slate-400 font-mono">({inv.student.student_id})</span>
                            </Link>
                          ) : (
                            `#${inv.student_id}`
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{inv.source_type}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          ৳ {inv.net_payable_amount}
                        </td>
                        <td className="py-2.5 px-3">{getInvoiceStatusBadge(inv.status)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            to={`/app/billing/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {isBn ? 'বিস্তারিত' : 'Detail'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Quick Actions & Fee Structures */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#182C4B] mb-3">
              {isBn ? 'দ্রুত কাজ' : 'Quick Actions'}
            </h2>
            <div className="divide-y divide-slate-100 text-sm">
              <Link
                to="/app/billing/fee-structures/new"
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-teal-700 font-medium"
              >
                <span>{isBn ? 'ফি কাঠামো তৈরি / সংস্করণ' : 'Create Fee Structure'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/app/billing/runs/new"
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-teal-700 font-medium"
              >
                <span>{isBn ? 'মাসিক টিউশন বিল প্রস্তুত' : 'Prepare Monthly Tuition Run'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/app/billing/categories"
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-teal-700 font-medium"
              >
                <span>{isBn ? 'ফি খাত ও বিলিং নিয়ম' : 'Fee Categories & Rules'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/app/billing/adjustments"
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-teal-700 font-medium"
              >
                <span>{isBn ? 'ছাড় / মওকুফ পর্যালোচনা' : 'Review Waivers & Discounts'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-sky-900 leading-relaxed flex gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'পরিশোধের রসিদ, নগদ লেনদেন ও দুই কপি A4 পেমেন্ট স্লিপ D07-এ তৈরি হবে। D06 শুধুমাত্র ধার্যকৃত ফি ও ইনভয়েস পরিচালনা করে।'
                  : 'Payment receipts, cash collection, and two-copy A4 payment slips are owned by D07. D06 manages fee structures, invoices, and billing schedules only.'}
              </span>
            </div>
          </section>

          {/* Active Fee Structures List */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#182C4B]">
                {isBn ? 'ফি কাঠামো তালিকা' : 'Fee Structures'}
              </h2>
              <Link
                to="/app/billing/fee-structures/new"
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                + {isBn ? 'নতুন' : 'New'}
              </Link>
            </div>
            {!structures.length ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                {isBn ? 'কোনো ফি কাঠামো নেই' : 'No fee structures found'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {structures.map((st) => (
                  <Link
                    key={st.id}
                    to={`/app/billing/fee-structures/${st.id}`}
                    className="block p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {isBn ? st.name_bn : st.name_en}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          st.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : st.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        v{st.version_no} · {st.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {st.code} · {st.effective_from?.slice(0, 10)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
