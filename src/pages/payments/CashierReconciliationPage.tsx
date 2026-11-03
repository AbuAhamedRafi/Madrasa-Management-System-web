import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../../services/paymentsApi';
import type { CashierShift } from '../../types/payments';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export const CashierReconciliationPage: React.FC = () => {
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Open Shift State
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('0.00');
  const [counterCode, setCounterCode] = useState('COUNTER_01');

  // Close Shift State
  const [activeShiftForClose, setActiveShiftForClose] = useState<CashierShift | null>(null);
  const [denomCounts, setDenomCounts] = useState<Record<number, number>>({});
  const [varianceReason, setVarianceReason] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getCashierShifts();
      setShifts(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ক্যাশিয়ার শিফট লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const calculatedCountedCash = Object.entries(denomCounts).reduce((sum, [denom, count]) => {
    return sum + parseInt(denom, 10) * (count || 0);
  }, 0);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentsApi.openCashierShift({
        opening_float_amount: parseFloat(openingFloat) || 0,
        counter_code: counterCode,
      });
      setShowOpenModal(false);
      fetchShifts();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'শিফট খুলতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShiftForClose) return;

    try {
      await paymentsApi.closeCashierShift(activeShiftForClose.id, {
        counted_cash_amount: calculatedCountedCash,
        denomination_breakdown: denomCounts as any,
        variance_reason: varianceReason.trim() || undefined,
        closing_notes: closingNotes.trim() || undefined,
      });
      setActiveShiftForClose(null);
      setDenomCounts({});
      setVarianceReason('');
      setClosingNotes('');
      fetchShifts();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'শিফট বন্ধ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleReconcileShift = async (shiftId: number) => {
    const notes = prompt('সমন্বয় নোট লিখুন (ঐচ্ছিক):') ?? '';
    try {
      await paymentsApi.reconcileCashierShift(shiftId, { reconciliation_notes: notes });
      fetchShifts();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'শিফট সমন্বয় অনুমোদন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ক্যাশিয়ার শিফট ও কাউন্টার ব্যালেন্সিং</h1>
          <p className="text-xs text-gray-500 mt-1">
            কাউন্টার ভিত্তিক দৈনিক ক্যাশ খোলার ফ্লোট, আদায় ও নোট গণনার সমন্বয়
          </p>
        </div>
        <button
          onClick={() => setShowOpenModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow"
        >
          + নতুন শিফট খুলুন
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b font-bold text-gray-800">ক্যাশিয়ার শিফট তালিকা</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">শিফট নং</th>
                <th className="px-4 py-3">ক্যাশিয়ার</th>
                <th className="px-4 py-3">কাউন্টার</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 font-mono text-right">প্রত্যাশিত জমা</th>
                <th className="px-4 py-3 font-mono text-right">গণনাকৃত নগদ</th>
                <th className="px-4 py-3 font-mono text-right">পার্থক্য (Variance)</th>
                <th className="px-4 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">লোড হচ্ছে...</td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">কোনো শিফট পাওয়া যায়নি</td></tr>
              ) : (
                shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{s.shift_number}</td>
                    <td className="px-4 py-3">{s.cashier?.name}</td>
                    <td className="px-4 py-3">{s.counter_code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                        s.status === 'RECONCILED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right font-medium">৳{s.expected_cash_amount}</td>
                    <td className="px-4 py-3 font-mono text-right">
                      {s.counted_cash_amount ? `৳${s.counted_cash_amount}` : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-right">
                      {s.variance_amount ? (
                        <span className={parseFloat(s.variance_amount) < 0 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                          ৳{s.variance_amount}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {s.status === 'OPEN' && (
                        <button
                          onClick={() => { setActiveShiftForClose(s); setDenomCounts({}); }}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded text-[11px] font-semibold hover:bg-amber-100"
                        >
                          শিফট বন্ধ করুন
                        </button>
                      )}
                      {(s.status === 'CLOSED' || s.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => handleReconcileShift(s.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-300 rounded text-[11px] font-semibold hover:bg-blue-100"
                        >
                          সমন্বয় অনুমোদন
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">নতুন ক্যাশিয়ার শিফট শুরু</h3>
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">কাউন্টার কোড</label>
                <input
                  type="text"
                  value={counterCode}
                  onChange={(e) => setCounterCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">প্রারম্ভিক নগদ ফ্লোট (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  শিফট শুরু
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal with Denomination Calculator */}
      {activeShiftForClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">শিফট ক্লোজিং ও ক্যাশ কাউন্টিং</h3>
                <p className="text-xs text-gray-500 font-mono">শিফট: {activeShiftForClose.shift_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">প্রত্যাশিত ক্যাশ</p>
                <p className="text-xl font-bold font-mono text-gray-900">৳{activeShiftForClose.expected_cash_amount}</p>
              </div>
            </div>

            {/* Denomination Calculator */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">টাকার নোট গণনা (Denomination Breakdown)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {DENOMINATIONS.map((d) => (
                  <div key={d} className="flex items-center gap-2 border p-1.5 rounded">
                    <span className="w-16 font-mono font-bold">৳{d} ×</span>
                    <input
                      type="number"
                      min="0"
                      value={denomCounts[d] || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setDenomCounts({ ...denomCounts, [d]: val });
                      }}
                      placeholder="সংখ্যা"
                      className="w-20 px-2 py-1 border rounded font-mono text-right"
                    />
                    <span className="flex-1 text-right font-mono font-medium text-gray-600">
                      = ৳{((denomCounts[d] || 0) * d).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200 flex justify-between items-center text-sm">
                <span className="font-semibold text-blue-950">মোট গণনাকৃত ক্যাশ:</span>
                <span className="font-mono font-bold text-lg text-blue-900">৳{calculatedCountedCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs px-1">
                <span>পার্থক্য (Variance):</span>
                <span className={`font-mono font-bold ${
                  calculatedCountedCash - parseFloat(activeShiftForClose.expected_cash_amount) === 0
                    ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  ৳{(calculatedCountedCash - parseFloat(activeShiftForClose.expected_cash_amount)).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
              {Math.abs(calculatedCountedCash - parseFloat(activeShiftForClose.expected_cash_amount)) > 0.001 && (
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">
                    ক্যাশ পার্থক্যের ব্যাখ্যা (Variance Reason) *
                  </label>
                  <input
                    type="text"
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.target.value)}
                    placeholder="পার্থক্য হওয়ার কারণ বিস্তারিত লিখুন..."
                    className="w-full px-3 py-2 border border-red-300 rounded text-xs"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ক্লোজিং মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="অন্যান্য মন্তব্য..."
                  className="w-full px-3 py-2 border rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveShiftForClose(null)}
                  className="px-4 py-2 border rounded text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
                >
                  শিফট ক্লোজ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
