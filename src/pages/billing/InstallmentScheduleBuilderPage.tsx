import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { InstallmentPlan, Invoice } from '../../types/billing';

export const InstallmentScheduleBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activePlan, setActivePlan] = useState<InstallmentPlan | null>(null);
  const [rows, setRows] = useState<Array<{ due_date: string; amount: string; notes: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await billingApi.getInstallmentPlan(Number(id));
      setInvoice(res.invoice);
      setActivePlan(res.active_plan);
      if (res.active_plan?.items?.length) {
        setRows(
          res.active_plan.items.map((it) => ({
            due_date: it.due_date.slice(0, 10),
            amount: it.amount,
            notes: it.notes || '',
          }))
        );
      } else {
        const net = parseFloat(res.invoice.net_payable_amount || '0');
        const half1 = (Math.floor((net / 2) * 100) / 100).toFixed(2);
        const half2 = (net - parseFloat(half1)).toFixed(2);
        setRows([
          { due_date: '2026-11-05', amount: half1, notes: '1st Installment' },
          { due_date: '2026-12-05', amount: half2, notes: '2nd Installment' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load installment plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const scheduledSum = rows
    .reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0)
    .toFixed(2);

  const invoiceNet = invoice?.net_payable_amount || '0.00';
  const isBalanced = Math.abs(parseFloat(scheduledSum) - parseFloat(invoiceNet)) < 0.005;

  const handleAddRow = () => {
    setRows([...rows, { due_date: '2027-01-05', amount: '0.00', notes: '' }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx: number, patch: Partial<{ due_date: string; amount: string; notes: string }>) => {
    setRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const saved = await billingApi.replaceInstallmentPlan(
        invoice.id,
        rows.map((r) => ({
          due_date: r.due_date,
          amount: r.amount,
          notes: r.notes || null,
        }))
      );
      setActivePlan(saved);
      setSuccessMsg(
        isBn
          ? `কিস্তির সূচি (v${saved.version_no}) সফলভাবে সংরক্ষিত হয়েছে!`
          : `Installment plan (v${saved.version_no}) saved successfully!`
      );
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          (isBn ? 'কিস্তি সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save installment plan')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        {isBn ? 'লোড হচ্ছে...' : 'Loading installment plan builder...'}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Link to="/app/billing" className="hover:underline text-teal-700">
              {isBn ? 'বিলিং' : 'Billing'}
            </Link>
            <span>/</span>
            <Link
              to={`/app/billing/invoices/${invoice?.id}`}
              className="hover:underline flex items-center gap-1 text-teal-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {invoice?.invoice_number}
            </Link>
            <span>/</span>
            <span>{isBn ? 'কিস্তি পরিকল্পনা' : 'Installments'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'কিস্তির সূচি নির্মাতা' : 'Installment Plan Builder'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ইনভয়েসের মোট বকেয়া অক্ষুণ্ণ রেখে পরিশোধের তারিখ ও কিস্তি পরিকল্পনা করুন'
              : 'Plan payment dates while preserving invoice balances and future cash allocations.'}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule Table */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#182C4B]">
              {isBn ? 'কিস্তির সময়সূচি' : 'Installment Schedule'}
            </h2>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
            >
              <Plus className="w-3.5 h-3.5" />
              {isBn ? 'কিস্তি যোগ করুন' : 'Add Installment'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500">{isBn ? 'ইনভয়েস' : 'Invoice'}</div>
              <div className="font-mono font-bold text-slate-800 mt-1">
                {invoice?.invoice_number}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500">{isBn ? 'মোট পরিমাণ' : 'Plan Amount'}</div>
              <div className="font-mono font-bold text-slate-800 mt-1">৳ {invoiceNet}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500">{isBn ? 'কিস্তির সংখ্যা' : 'Installments'}</div>
              <div className="font-bold text-slate-800 mt-1">{rows.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500">{isBn ? 'সংস্করণ' : 'Plan Version'}</div>
              <div className="font-bold text-teal-700 mt-1">
                {activePlan ? `v${activePlan.version_no} (${activePlan.status})` : 'New Draft'}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'শেষ তারিখ (Due Date)' : 'Due Date'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'নির্ধারিত পরিমাণ (৳)' : 'Scheduled Amount'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'মন্তব্য' : 'Notes'}</th>
                  <th className="py-2.5 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        required
                        value={row.due_date}
                        onChange={(e) => handleUpdateRow(idx, { due_date: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={row.amount}
                        onChange={(e) => handleUpdateRow(idx, { amount: e.target.value })}
                        className="w-32 px-2.5 py-1.5 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleUpdateRow(idx, { notes: e.target.value })}
                        placeholder={isBn ? 'ঐচ্ছিক নোট' : 'Optional note'}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isBn ? 'কিস্তি পরিকল্পনা সংরক্ষণ করুন' : 'Save Installment Plan'}
            </button>
          </div>
        </form>

        {/* Right Column: Policy & Calculations */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#182C4B]">
            {isBn ? 'নীতি ও হিসাব যাচাই' : 'Policy & Calculations'}
          </h2>

          <div className="divide-y divide-dashed divide-slate-200 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">{isBn ? 'ইনভয়েসের মোট নিট' : 'Invoice Net Total'}</span>
              <strong className="font-mono text-slate-800">৳ {invoiceNet}</strong>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">{isBn ? 'কিস্তির যোগফল' : 'Installment Sum'}</span>
              <strong
                className={`font-mono ${isBalanced ? 'text-emerald-700' : 'text-rose-600'}`}
              >
                ৳ {scheduledSum}
              </strong>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">{isBn ? 'নথিভুক্ত আদায় (D07)' : 'Amount Collected (D07)'}</span>
              <strong className="font-mono text-slate-600">৳ 0.00</strong>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">{isBn ? 'অবশিষ্ট বকেয়া' : 'Outstanding Balance'}</span>
              <strong className="font-mono text-slate-900">৳ {invoiceNet}</strong>
            </div>
          </div>

          {isBalanced ? (
            <div className="p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 text-xs text-emerald-800 font-medium">
              ✓{' '}
              {isBn
                ? 'কিস্তির যোগফল ইনভয়েসের নিট দেয় পরিমাণের সমান।'
                : 'Scheduled dates and amounts balance to the full invoice value.'}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-rose-50 border-l-4 border-rose-500 text-xs text-rose-800 font-medium">
              ✕{' '}
              {isBn
                ? `কিস্তির যোগফল (৳${scheduledSum}) অবশ্যই ইনভয়েসের নিট পরিমাণের (৳${invoiceNet}) সমান হতে হবে।`
                : `Installment sum (৳${scheduledSum}) must equal invoice net total (৳${invoiceNet}).`}
            </div>
          )}

          <div className="p-3 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-sky-900 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              {isBn
                ? 'কিস্তি পরিকল্পনা শুধুমাত্র একটি সময়সূচি। এটি কোনো কিস্তি পরিশোধিত হওয়ার প্রমাণ নয়। প্রকৃত অর্থ আদায় D07-এ নথিভুক্ত হয়।'
                : 'An installment plan is a schedule only. It is never proof that an installment has been paid. D07 records actual collections.'}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
