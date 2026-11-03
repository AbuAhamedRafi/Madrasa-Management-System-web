import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';
import type { PaymentDashboardData } from '../../types/payments';

export const CashCollectionDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaymentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slipLookupNumber, setSlipLookupNumber] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ক্যাশ কালেকশন ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipLookupNumber.trim()) return;
    try {
      setLookupError(null);
      const slip = await paymentsApi.lookupSlip(slipLookupNumber.trim());
      navigate(`/app/payments/collect/${slip.id}`);
    } catch (err: any) {
      setLookupError(err?.response?.data?.error?.message || 'পেমেন্ট স্লিপ পাওয়া যায়নি। নম্বরটি যাচাই করুন।');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              D07 ক্যাশ ম্যানেজমেন্ট
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xs text-gray-500">লাইভ ক্যাশ কাউন্টার ও রসিদ খতিয়ান</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">ক্যাশ কালেকশন ও পেমেন্ট রসিদ ড্যাশবোর্ড</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/payments/slips/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + নতুন স্লিপ ইস্যু
          </Link>
          <Link
            to="/app/payments/cashier-shifts"
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            ক্যাশিয়ার শিফট খতিয়ান
          </Link>
          <Link
            to="/app/payments/reversals"
            className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-sm font-medium hover:bg-amber-100 transition"
          >
            রিভার্সাল অনুমোদন কিউ
          </Link>
        </div>
      </div>

      {/* Quick Slip Lookup Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
              দ্রুত কালেকশন: পেমেন্ট স্লিপ নম্বর স্ক্যান বা লিখুন (PS-YYYY-NNNNNN)
            </label>
            <input
              type="text"
              value={slipLookupNumber}
              onChange={(e) => setSlipLookupNumber(e.target.value)}
              placeholder="উদাহরণ: PS-2026-000001"
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-mono text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-auto"
          >
            <span>টাকা জমা গ্রহণ করুন</span>
            <span>&rarr;</span>
          </button>
        </form>
        {lookupError && <p className="text-red-600 text-sm mt-2">{lookupError}</p>}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">আজকের নগদ জমা</p>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            ৳{loading ? '...' : data?.metrics.today_collections || '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">কাউন্টার থেকে নিশ্চিতকৃত</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">আজকের ইস্যুকৃত রসিদ</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
            {loading ? '...' : data?.metrics.today_receipt_count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">অফিসিয়াল মানি রসিদ (RC)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">বকেয়া পেমেন্ট স্লিপ</p>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {loading ? '...' : data?.metrics.unpaid_slips_count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">অর্থ জমার অপেক্ষায়</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">সক্রিয় ক্যাশিয়ার শিফট</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2 font-mono">
            {loading ? '...' : data?.metrics.active_shifts_count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">কাউন্টার কর্মরত</p>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">সাম্প্রতিক নগদ কালেকশন ও রসিদ</h2>
          <div className="flex gap-2">
            <Link
              to="/app/payments/notifications"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              এসএমএস আউটবক্স দেখুন &rarr;
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-3">ট্রানজ্যাকশন আইডি</th>
                <th className="px-6 py-3">রসিদ নম্বর</th>
                <th className="px-6 py-3">শিক্ষার্থী</th>
                <th className="px-6 py-3">পরিমাণ</th>
                <th className="px-6 py-3">ক্যাশিয়ার</th>
                <th className="px-6 py-3">সময়</th>
                <th className="px-6 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    তথ্য লোড হচ্ছে...
                  </td>
                </tr>
              ) : !data?.recent_payments || data.recent_payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    আজ কোনো নগদ জমার তথ্য নেই।
                  </td>
                </tr>
              ) : (
                data.recent_payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{p.payment_reference}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600">{p.receipt?.receipt_number || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.student?.name_bn || p.student?.name_en}</div>
                      <div className="text-xs text-gray-400 font-mono">{p.student?.student_code}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700">৳{p.amount_received}</td>
                    <td className="px-6 py-4 text-xs">{p.collector?.name || 'ক্যাশিয়ার'}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(p.collected_at).toLocaleTimeString('bn-BD')}</td>
                    <td className="px-6 py-4 text-right">
                      {p.receipt && (
                        <Link
                          to={`/app/payments/${p.id}/receipt`}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium hover:bg-indigo-100"
                        >
                          ২-কপি রসিদ প্রিন্ট
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

