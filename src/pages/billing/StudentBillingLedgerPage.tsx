import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  User,
  Receipt,
  Percent,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { StudentBillingLedger } from '../../types/billing';

export const StudentBillingLedgerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [ledger, setLedger] = useState<StudentBillingLedger | null>(null);
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadLedger = async () => {
      try {
        setLoading(true);
        const data = await billingApi.getStudentLedger(Number(id));
        setLedger(data);
      } catch (err) {
        console.error('Failed to load student billing ledger', err);
      } finally {
        setLoading(false);
      }
    };
    loadLedger();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        {isBn ? 'শিক্ষার্থীর খতিয়ান লোড হচ্ছে...' : 'Loading student billing ledger...'}
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="p-6 text-center text-sm text-rose-600">
        {isBn ? 'শিক্ষার্থীর খতিয়ান পাওয়া যায়নি' : 'Student billing ledger not found'}
      </div>
    );
  }

  const filteredEntries = ledger.entries.filter((e) => {
    if (sourceFilter && e.source_type !== sourceFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Link
              to={`/app/students/${ledger.student.id}`}
              className="hover:underline flex items-center gap-1 text-teal-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? ledger.student.full_name_bn : ledger.student.full_name_en}
            </Link>
            <span>/</span>
            <span>{isBn ? 'ফি খতিয়ান' : 'Billing Ledger'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'শিক্ষার্থীর ফি খতিয়ান' : 'Student Fee & Billing Ledger'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'স্থায়ী Student ID অনুযায়ী ভর্তি, প্রমোশন, মাসিক টিউশন ও অন্যান্য ইনভয়েস'
              : 'Admission, promotion, monthly tuition, and manual invoices by permanent Student ID.'}
          </p>
        </div>

        <Link
          to="/app/billing"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        >
          {isBn ? 'বিলিং ড্যাশবোর্ডে যান' : 'Billing Dashboard'}
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'শিক্ষার্থী ID (স্থায়ী)' : 'Permanent Student ID'}</span>
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#182C4B] mt-2">
            {ledger.student.student_id}
          </div>
          <div className="text-xs text-slate-600 font-medium mt-1">
            {isBn ? ledger.student.full_name_bn : ledger.student.full_name_en}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'মোট ধার্যকৃত বিল (Gross)' : 'Total Gross Billed'}</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">
            ৳ {ledger.summary.total_gross_billed}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {ledger.summary.issued_invoices_count}{' '}
            {isBn ? 'টি ইস্যুকৃত ইনভয়েস' : 'issued invoices'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'অনুমোদিত ছাড় / মওকুফ' : 'Approved Adjustments'}</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">
            − ৳ {ledger.summary.total_adjustments_applied}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {ledger.summary.pending_adjustment_requests_count}{' '}
            {isBn ? 'টি অনুমোদনের অপেক্ষায়' : 'pending review'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'নিট দেয় (হিসাব)' : 'Total Net Billed'}</span>
            <AlertCircle className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-extrabold text-teal-800 mt-2">
            ৳ {ledger.summary.total_net_billed}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'আদায়কৃত তথ্য D07-এ যুক্ত হবে' : 'D07 tracks cash collection'}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#182C4B]">
            {isBn ? 'ইনভয়েস ও ফি খতিয়ান তালিকা' : 'Student Invoice Ledger'}
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="">{isBn ? 'সকল উৎস' : 'All Sources'}</option>
              <option value="ADMISSION">ADMISSION</option>
              <option value="MONTHLY_RUN">MONTHLY_RUN</option>
              <option value="PROMOTION">PROMOTION</option>
              <option value="MANUAL">MANUAL</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="ISSUED">{isBn ? 'ইস্যুকৃত' : 'ISSUED'}</option>
              <option value="DRAFT">{isBn ? 'খসড়া' : 'DRAFT'}</option>
              <option value="VOIDED">{isBn ? 'বাতিলকৃত' : 'VOIDED'}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-3 font-semibold">{isBn ? 'ইনভয়েস' : 'Invoice #'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'উৎস' : 'Source'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'শিক্ষাবর্ষ / শ্রেণি' : 'Period / Class'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'শেষ তারিখ' : 'Due Date'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'মোট (Gross)' : 'Subtotal'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'ছাড়' : 'Adjustment'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'নিট দেয়' : 'Net Payable'}</th>
                <th className="py-3 px-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3 px-3 text-right">{isBn ? 'বিস্তারিত' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!filteredEntries.length ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    {isBn ? 'কোনো ইনভয়েস রেকর্ড পাওয়া যায়নি' : 'No ledger entries found'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.invoice_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">
                      <Link
                        to={`/app/billing/invoices/${entry.invoice_id}`}
                        className="hover:underline"
                      >
                        {entry.invoice_number}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{entry.source_type}</td>
                    <td className="py-3 px-3 text-slate-700">
                      <div>
                        {isBn
                          ? entry.class_name_bn || entry.class_name_en
                          : entry.class_name_en}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {entry.billing_month
                          ? entry.billing_month.slice(0, 7)
                          : isBn
                          ? entry.period_name_bn || entry.period_name_en
                          : entry.period_name_en}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{entry.due_date}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      ৳ {entry.subtotal_amount}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-700">
                      − ৳ {entry.adjustment_total_amount}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ৳ {entry.net_payable_amount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.status === 'ISSUED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.status === 'VOIDED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/app/billing/invoices/${entry.invoice_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isBn ? 'দেখুন' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audit & Boundary Note */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#182C4B] mb-2">
          {isBn ? 'বিলিং উৎস ও নিরীক্ষা নোট' : 'Billing Source & Audit Note'}
        </h3>
        <div className="p-3.5 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-sky-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'এই তালিকা একই স্থায়ী Student ID-এর একাধিক শিক্ষাবর্ষ / সেশন সমর্থন করে। D06 ইনভয়েসের উৎস এবং D07-এর বাস্তব নগদ আদায় সম্পূর্ণ আলাদা রাখে।'
              : 'This ledger supports multiple academic periods and sessions under the same permanent Student ID. D06 strictly separates charge assessment from D07 cash collections.'}
          </span>
        </div>
      </section>
    </div>
  );
};

