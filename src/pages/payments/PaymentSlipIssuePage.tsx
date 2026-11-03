import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';
import { billingApi } from '../../services/billingApi';
import type { InvoiceDetail } from '../../types/billing';

export const PaymentSlipIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [invoiceIdInput, setInvoiceIdInput] = useState('');
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slipAmount, setSlipAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [supersedeExisting, setSupersedeExisting] = useState<boolean>(true);

  const handleInvoiceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceIdInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await billingApi.getInvoice(parseInt(invoiceIdInput.trim(), 10));
      setInvoice(res);
      setSlipAmount(res.balance_amount);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ইনভয়েস খুঁজে পাওয়া যায়নি।');
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSlip = async () => {
    if (!invoice) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await paymentsApi.createSlip({
        invoice_id: invoice.id,
        slip_amount: parseFloat(slipAmount),
        notes: notes.trim() || undefined,
        supersede_existing: supersedeExisting,
      });
      navigate(`/app/payments/slips/${res.id}/print`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'পেমেন্ট স্লিপ ইস্যু করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">নতুন পেমেন্ট স্লিপ ইস্যু করুন</h1>
        <p className="text-sm text-gray-500 mt-1">
          অননুমোদিত বা বকেয়া ইনভয়েসের জন্য অফিস ও শিক্ষার্থী কপি সম্বলিত ২-কপি A4 পেমেন্ট স্লিপ তৈরি করুন।
        </p>

        {/* Invoice Lookup Form */}
        <form onSubmit={handleInvoiceSearch} className="mt-6 flex gap-4">
          <input
            type="number"
            value={invoiceIdInput}
            onChange={(e) => setInvoiceIdInput(e.target.value)}
            placeholder="ইনভয়েস আইডি লিখুন (যেমন: 1, 2...)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'অনুসন্ধান...' : 'ইনভয়েস যাচাই'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {invoice && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  ইনভয়েস নং: {invoice.invoice_number}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {invoice.student?.name_bn || invoice.student?.name_en}
                </h3>
                <p className="text-xs text-gray-500 font-mono">আইডি: {invoice.student?.student_code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">বকেয়া পরিমাণ</p>
                <p className="text-2xl font-bold text-amber-600 font-mono">৳{invoice.balance_amount}</p>
                <p className="text-xs text-gray-400">মোট ধার্য: ৳{invoice.total_amount}</p>
              </div>
            </div>
          </div>

          {/* Line items preview */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">ইনভয়েসের খাতসমূহ</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 font-semibold border-b">
                  <tr>
                    <th className="px-4 py-2">খাতের নাম</th>
                    <th className="px-4 py-2">ভর্তির শর্ত</th>
                    <th className="px-4 py-2 text-right">ধার্য</th>
                    <th className="px-4 py-2 text-right">পরিশোধিত</th>
                    <th className="px-4 py-2 text-right">বকেয়া</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">{it.name}</td>
                      <td className="px-4 py-2">
                        {it.admission_required ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                            ভর্তির জন্য আবশ্যক
                          </span>
                        ) : (
                          <span className="text-gray-400">নিয়মিত ফি</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">৳{it.net_amount}</td>
                      <td className="px-4 py-2 text-right font-mono text-emerald-600">৳{it.paid_amount}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-amber-700">৳{it.balance_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slip issuance configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পেমেন্ট স্লিপের টাকার পরিমাণ (৳)
              </label>
              <input
                type="number"
                step="0.01"
                max={parseFloat(invoice.balance_amount)}
                min="0.01"
                value={slipAmount}
                onChange={(e) => setSlipAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">বকেয়া পরিমাণের বেশি স্লিপ ইস্যু করা যাবে না।</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">বিশেষ নোট (যদি থাকে)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="স্লিপে প্রদর্শনের জন্য নোট লিখুন"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="supersede"
              checked={supersedeExisting}
              onChange={(e) => setSupersedeExisting(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="supersede" className="text-xs text-gray-700">
              পূর্বের অপূর্ণ পেমেন্ট স্লিপ থাকলে তা বাতিল করে নতুন স্লিপ প্রতিস্থাপন করুন (Supersede)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/app/payments')}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={submitting || parseFloat(slipAmount) <= 0}
              onClick={handleIssueSlip}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'স্লিপ তৈরি হচ্ছে...' : 'স্লিপ ইস্যু ও প্রিন্ট করুন'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
