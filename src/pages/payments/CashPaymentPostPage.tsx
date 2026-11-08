import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';
import type { PaymentSlip } from '../../types/payments';

export const CashPaymentPostPage: React.FC = () => {
  const { slipId } = useParams<{ slipId: string }>();
  const navigate = useNavigate();

  const [slip, setSlip] = useState<PaymentSlip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amountReceived, setAmountReceived] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        setLoading(true);
        const res = await paymentsApi.getSlip(parseInt(slipId!, 10));
        setSlip(res);
        setAmountReceived(res.remaining_amount);
        setCashTendered(res.remaining_amount);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'পেমেন্ট স্লিপ লোড করা যায়নি।');
      } finally {
        setLoading(false);
      }
    };
    if (slipId) fetchSlip();
  }, [slipId]);

  useEffect(() => {
    const rec = parseFloat(amountReceived) || 0;
    const ten = parseFloat(cashTendered) || 0;
    setChangeAmount(Math.max(0, Math.round((ten - rec) * 100) / 100));
  }, [amountReceived, cashTendered]);

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slip) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await paymentsApi.collectCash(slip.id, {
        amount_received: parseFloat(amountReceived),
        cash_tendered_amount: parseFloat(cashTendered),
        remarks: remarks.trim() || undefined,
      });

      // Redirect to official receipt print page
      navigate(`/app/payments/${res.payment.id}/receipt`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'টাকা জমা গ্রহণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">পেমেন্ট স্লিপ তথ্য লোড হচ্ছে...</div>;
  }

  if (error && !slip) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              নগদ অর্থ জমা গ্রহণ (Post Cash)
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              স্লিপ নং: {slip?.slip_number}
            </h1>
            <p className="text-xs text-gray-500">ইনভয়েস: {slip?.invoice?.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">স্লিপে বকেয়া পরিমাণ</p>
            <p className="text-2xl font-bold font-mono text-emerald-700">৳{slip?.remaining_amount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {slip && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student & Item Breakdown */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-800">শিক্ষার্থী ও খাতের বিবরণ</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
              <p><span className="font-semibold">নাম:</span> {slip.student?.name_bn || slip.student?.name_en}</p>
              <p><span className="font-semibold">আইডি:</span> {slip.student?.student_code}</p>
              <p><span className="font-semibold">সেশন/মেয়াদ:</span> {slip.academic_period?.name}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">ইনভয়েসের খাতভিত্তিক বকেয়া</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2">খাত</th>
                      <th className="px-3 py-2">শর্ত</th>
                      <th className="px-3 py-2 text-right">বকেয়া</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {slip.invoice?.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2 font-medium">{it.name}</td>
                        <td className="px-3 py-2">
                          {it.admission_required ? (
                            <span className="text-red-600 font-semibold">ভর্তি আবশ্যক</span>
                          ) : (
                            <span className="text-gray-400">সাধারণ</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold">৳{it.balance_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cash Payment Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-800">নগদ গণনা ও নিশ্চিতকরণ</h3>

            <form onSubmit={handleCollect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  জমা গ্রহণের পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={parseFloat(slip.remaining_amount)}
                  min="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-base font-mono font-bold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  গ্রাহক প্রদত্ত নগদ টাকা (Tendered)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={parseFloat(amountReceived) || 0}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-base font-mono"
                  required
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-800 font-semibold">ফেরত দেওয়ার পরিমাণ (Change)</p>
                <p className="text-xl font-bold font-mono text-emerald-700 mt-1">৳{changeAmount.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="নগদ জমা সম্পর্কিত কোনো বিশেষ মন্তব্য..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || parseFloat(amountReceived) <= 0}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? 'টাকা জমা হচ্ছে...' : 'নগদ জমা ও রসিদ ইস্যু'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

