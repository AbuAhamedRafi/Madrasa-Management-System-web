import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../../services/paymentsApi';
import type { PaymentReversalRequest } from '../../types/payments';

export const ReversalApprovalQueuePage: React.FC = () => {
  const [requests, setRequests] = useState<PaymentReversalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getReversalRequests();
      setRequests(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'রিভার্সাল তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    const notes = prompt('অনুমোদন মন্তব্য লিখুন (ঐচ্ছিক):') ?? '';
    try {
      await paymentsApi.approveReversal(id, notes);
      alert('রিভার্সাল সফলভাবে অনুমোদিত হয়েছে এবং ব্যালেন্স সমন্বয় সম্পন্ন হয়েছে।');
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'অনুমোদন ব্যর্থ হয়েছে। (নিজের আবেদন অনুমোদন নিষিদ্ধ)');
    }
  };

  const handleReject = async (id: number) => {
    const notes = prompt('বাতিলের কারণ লিখুন:') ?? '';
    if (!notes.trim()) return;
    try {
      await paymentsApi.rejectReversal(id, notes);
      alert('রিভার্সাল আবেদন বাতিল করা হয়েছে।');
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'বাতিলকরণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">পেমেন্ট রিভার্সাল অনুমোদন কিউ</h1>
        <p className="text-xs text-gray-500 mt-1">
          ভুল পোস্টিং বা দ্বৈত এন্ট্রির জন্য সুপারভাইজার কর্তৃক দ্বৈত নিয়ন্ত্রণ (Dual Control) অনুমোদন
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">আবেদন আইডি</th>
                <th className="px-4 py-3">পেমেন্ট রেফারেন্স</th>
                <th className="px-4 py-3">শিক্ষার্থী</th>
                <th className="px-4 py-3">কারণ</th>
                <th className="px-4 py-3">আবেদনকারী</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">লোড হচ্ছে...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">কোনো আবেদন অপেক্ষমাণ নেই</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{r.request_number}</td>
                    <td className="px-4 py-3 font-mono">{r.payment?.payment_reference}</td>
                    <td className="px-4 py-3">{r.student?.name_bn || r.student?.name_en}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={r.reason_details}>
                      <span className="font-semibold text-gray-800">[{r.reason_category}]</span> {r.reason_details}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.requester?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-300 rounded text-[11px] font-semibold hover:bg-red-100"
                          >
                            বাতিল
                          </button>
                        </>
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

