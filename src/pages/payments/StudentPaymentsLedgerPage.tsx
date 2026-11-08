import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';

export const StudentPaymentsLedgerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const res = await paymentsApi.getStudentPayments(parseInt(id!, 10));
        setData(res);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'শিক্ষার্থীর পেমেন্ট খতিয়ান লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLedger();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">খতিয়ান লোড হচ্ছে...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-600">{error || 'ডাটা পাওয়া যায়নি।'}</div>;

  const summary = data.summary || {};
  const student = data.student || {};
  const clearance = summary.admission_clearance;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Student Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            শিক্ষার্থী পেমেন্ট খতিয়ান
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{student.name_bn || student.name_en}</h1>
          <p className="text-xs font-mono text-gray-500">আইডি: {student.student_code}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/app/students/${student.id}/billing-ledger`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            বিলিং লেজার দেখুন &rarr;
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">মোট ধার্য (Total Billed)</p>
          <p className="text-xl font-bold font-mono text-gray-900 mt-1">৳{summary.total_billed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">মোট পরিশোধিত (Total Paid)</p>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">৳{summary.total_paid}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">বর্তমান বকেয়া (Outstanding)</p>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">৳{summary.current_outstanding}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">ভর্তি পেমেন্ট ক্লিয়ারেন্স</p>
          {clearance?.is_settled ? (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ✓ পরিশোধিত (Approved)
            </span>
          ) : (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              বকেয়া: ৳{clearance?.required_outstanding || '0.00'}
            </span>
          )}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b font-bold text-gray-800">নগদ প্রাপ্তি ও রসিদ হিস্ট্রি</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">ট্রানজ্যাকশন আইডি</th>
                <th className="px-4 py-3">রসিদ নম্বর</th>
                <th className="px-4 py-3">পরিমাণ</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3">তারিখ ও সময়</th>
                <th className="px-4 py-3 text-right">রসিদ প্রিন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.payments?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">কোনো পেমেন্ট তথ্য নেই</td></tr>
              ) : (
                data.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium">{p.payment_reference}</td>
                    <td className="px-4 py-3 font-mono text-indigo-600">{p.receipt?.receipt_number || 'N/A'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">৳{p.amount_received}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.collected_at).toLocaleDateString('bn-BD')}</td>
                    <td className="px-4 py-3 text-right">
                      {p.receipt && (
                        <Link
                          to={`/app/payments/${p.id}/receipt`}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-[11px] font-medium hover:bg-indigo-100"
                        >
                          রসিদ দেখুন
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

