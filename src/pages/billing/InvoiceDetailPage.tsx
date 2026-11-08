import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  Send,
  Ban,
  Percent,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { AdjustmentType, Invoice, InvoiceItem } from '../../types/billing';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Void Modal
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  // Adjustment Request Modal
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [adjType, setAdjType] = useState<AdjustmentType>('WAIVER');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await billingApi.getInvoice(Number(id));
      setInvoice(data);
    } catch (err) {
      console.error('Failed to load invoice', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleIssue = async () => {
    if (!invoice) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const updated = await billingApi.issueInvoice(invoice.id, invoice.lock_version);
      setInvoice(updated);
      setSuccessMsg(
        isBn ? 'ইনভয়েস সফলভাবে ইস্যু করা হয়েছে!' : 'Invoice issued successfully!'
      );
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to issue invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const updated = await billingApi.voidInvoice(invoice.id, voidReason, invoice.lock_version);
      setInvoice(updated);
      setShowVoidModal(false);
      setSuccessMsg(isBn ? 'ইনভয়েস বাতিল করা হয়েছে' : 'Invoice voided');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to void invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !selectedItem) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      await billingApi.createAdjustmentRequest({
        invoice_id: invoice.id,
        invoice_item_id: selectedItem.id,
        adjustment_type: adjType,
        requested_amount: adjAmount,
        reason: adjReason,
      });
      setSelectedItem(null);
      setSuccessMsg(
        isBn
          ? 'ছাড় / মওকুফ আবেদন জমা দেওয়া হয়েছে (প্রশাসনিক অনুমোদনের অপেক্ষায়)'
          : 'Adjustment request submitted for administrative approval'
      );
      await loadInvoice();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit adjustment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        {isBn ? 'ইনভয়েস লোড হচ্ছে...' : 'Loading invoice detail...'}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center text-sm text-rose-600">
        {isBn ? 'ইনভয়েস পাওয়া যায়নি' : 'Invoice not found'}
      </div>
    );
  }

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
            <span>{invoice.invoice_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'ইনভয়েসের বিস্তারিত' : 'Invoice Detail'} — {invoice.invoice_number}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ব্যক্তিগত বিলিং, চার্জ খাত ও হিসাব নিরীক্ষা'
              : 'Individual charge assessment, adjustments, and billing audit'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {invoice.status !== 'VOIDED' && (
            <Link
              to={`/app/billing/invoices/${invoice.id}/installments`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100"
            >
              <Calendar className="w-4 h-4" />
              {isBn ? 'কিস্তির সূচি (Installments)' : 'Installment Plan'}
            </Link>
          )}

          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleIssue}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
            >
              <Send className="w-4 h-4" />
              {isBn ? 'ইনভয়েস ইস্যু করুন' : 'Issue Invoice'}
            </button>
          )}

          {invoice.status !== 'VOIDED' && (
            <button
              onClick={() => setShowVoidModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              <Ban className="w-4 h-4" />
              {isBn ? 'বাতিল করুন (Void)' : 'Void Invoice'}
            </button>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 2 Columns: Invoice Identity */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#182C4B] pb-2 border-b border-slate-100">
            {isBn ? 'ইনভয়েস পরিচিতি' : 'Invoice Identity'}
          </h2>

          <div className="divide-y divide-dashed divide-slate-200 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'ইনভয়েস নম্বর' : 'Invoice Number'}</span>
              <strong className="font-mono text-slate-800 text-sm">{invoice.invoice_number}</strong>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'শিক্ষার্থী' : 'Student'}</span>
              {invoice.student ? (
                <Link
                  to={`/app/students/${invoice.student.id}/billing-ledger`}
                  className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>
                    {isBn ? invoice.student.full_name_bn : invoice.student.full_name_en} ·{' '}
                    {invoice.student.student_id}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <strong>#{invoice.student_id}</strong>
              )}
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'শ্রেণি / শিক্ষাবর্ষ' : 'Class / Period'}</span>
              <strong className="text-slate-800">
                {isBn
                  ? invoice.program_class?.name_bn || invoice.program_class?.name_en
                  : invoice.program_class?.name_en}{' '}
                · {invoice.period?.name_en || invoice.period?.code}
              </strong>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'এনরোলমেন্ট ID' : 'Enrollment ID'}</span>
              <Link
                to={`/app/enrollments/${invoice.enrollment_id}`}
                className="font-mono font-bold text-slate-700 hover:underline"
              >
                ENR-#{invoice.enrollment_id} ({invoice.enrollment?.enrollment_status})
              </Link>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'উৎস (Source)' : 'Source Type'}</span>
              <span className="font-mono text-slate-700">
                {invoice.source_type} ({invoice.source_reference})
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'ইনভয়েস অবস্থা' : 'Invoice Status'}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  invoice.status === 'ISSUED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : invoice.status === 'VOIDED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {invoice.status === 'ISSUED'
                  ? isBn
                    ? 'ইস্যুকৃত'
                    : 'ISSUED'
                  : invoice.status === 'VOIDED'
                  ? isBn
                    ? 'বাতিলকৃত'
                    : 'VOIDED'
                  : isBn
                  ? 'খসড়া'
                  : 'DRAFT'}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500">{isBn ? 'শেষ তারিখ' : 'Due Date'}</span>
              <strong className="font-mono text-slate-800">
                {invoice.due_date?.slice(0, 10)}
              </strong>
            </div>

            {invoice.void_reason && (
              <div className="py-2.5 flex justify-between items-center text-rose-700">
                <span>{isBn ? 'বাতিলের কারণ' : 'Void Reason'}</span>
                <strong>{invoice.void_reason}</strong>
              </div>
            )}
          </div>
        </section>

        {/* Right 3 Columns: Charge Breakdown */}
        <section className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#182C4B]">
              {isBn ? 'চার্জের বিস্তারিত' : 'Charge Line Breakdown'}
            </h2>
            <Link
              to="/app/billing/adjustments"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              {isBn ? 'ছাড় অনুমোদন কিউ দেখুন →' : 'View Waiver Queue →'}
            </Link>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'বিবরণ' : 'Description'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'মোট (Gross)' : 'Gross'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'ছাড় / মওকুফ' : 'Adjustment'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'নিট দেয়' : 'Net'}</th>
                  <th className="py-2.5 px-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invoice.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">
                        {isBn ? item.description_bn : item.description_en}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.category?.code}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      ৳ {item.gross_amount}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">
                      {parseFloat(item.adjustment_amount) > 0
                        ? `− ৳ ${item.adjustment_amount}`
                        : '৳ 0.00'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      ৳ {item.net_amount}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {invoice.status !== 'VOIDED' && parseFloat(item.net_amount) > 0 && (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjAmount('100.00');
                            setAdjReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-[11px]"
                        >
                          <Percent className="w-3 h-3" />
                          {isBn ? 'ছাড়ের আবেদন' : 'Request Waiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-dashed divide-slate-200 text-xs pt-2">
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">{isBn ? 'মোট ধার্যকৃত (Subtotal)' : 'Subtotal Gross'}</span>
              <strong className="font-mono">৳ {invoice.subtotal_amount}</strong>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">
                {isBn ? 'অনুমোদিত ছাড় / মওকুফ' : 'Approved Adjustments'}
              </span>
              <strong className="font-mono text-amber-700">
                − ৳ {invoice.adjustment_total_amount}
              </strong>
            </div>
            <div className="py-2.5 flex justify-between text-sm">
              <span className="font-bold text-[#182C4B]">
                {isBn ? 'নিট দাবিকৃত (Net Payable)' : 'Net Billed Liability'}
              </span>
              <strong className="font-mono font-extrabold text-[#182C4B]">
                ৳ {invoice.net_payable_amount}
              </strong>
            </div>
            <div className="py-2 flex justify-between text-slate-500">
              <span>{isBn ? 'নিবন্ধিত আদায় (D07 থেকে)' : 'Verified Collected (D07)'}</span>
              <strong className="font-mono">৳ 0.00</strong>
            </div>
            <div className="py-2 flex justify-between text-teal-800 font-semibold">
              <span>{isBn ? 'হিসাব অনুযায়ী বকেয়া' : 'Calculated Balance'}</span>
              <strong className="font-mono">৳ {invoice.net_payable_amount}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Next Steps & D07 Boundary Notice */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#182C4B] mb-2">
          {isBn ? 'পরবর্তী ধাপ ও সীমাবদ্ধতা (D06 ↔ D07 সীমানা)' : 'Next Steps & D07 Settlement Boundary'}
        </h3>
        <div className="p-3.5 rounded-lg bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'এই স্ক্রিনটি বিলিং বিবরণ দেখায়, নগদ টাকা গ্রহণ করে না। অর্থ গ্রহণ, দুই-কপি A4 পেমেন্ট স্লিপ, রসিদ ও আর্থিক সমন্বয় D07-এর অধীনে থাকবে।'
              : 'This screen displays billing liability only and never collects cash. Cash collection, two-copy A4 payment slips, receipts, and financial settlement belong strictly to Deliverable D07.'}
          </span>
        </div>
      </section>

      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-rose-800">
              {isBn ? 'ইনভয়েস বাতিল করুন (Void)' : 'Void Invoice'}
            </h3>
            <form onSubmit={handleVoid} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'বাতিলের সুনির্দিষ্ট কারণ' : 'Mandatory Void Reason'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  {isBn ? 'ফিরে যান' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold"
                >
                  {isBn ? 'নিশ্চিত বাতিল করুন' : 'Confirm Void'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Waiver Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#182C4B]">
              {isBn ? 'ছাড় / মওকুফ আবেদন' : 'Request Discount / Waiver'} —{' '}
              {isBn ? selectedItem.description_bn : selectedItem.description_en}
            </h3>
            <form onSubmit={handleRequestAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {isBn ? 'ছাড়ের ধরন' : 'Adjustment Type'}
                  </label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as AdjustmentType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="WAIVER">WAIVER</option>
                    <option value="DISCOUNT">DISCOUNT</option>
                    <option value="SCHOLARSHIP">SCHOLARSHIP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {isBn ? 'পরিমাণ (৳)' : 'Amount (BDT)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedItem.net_amount}
                    required
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {isBn ? 'আবেদনের কারণ' : 'Reason for Waiver/Discount'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#137C73] text-white font-bold"
                >
                  {isBn ? 'আবেদন জমা দিন' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

