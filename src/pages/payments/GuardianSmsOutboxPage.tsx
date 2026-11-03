import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../../services/paymentsApi';
import type { PaymentNotification } from '../../types/payments';

export const GuardianSmsOutboxPage: React.FC = () => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getNotifications();
      setNotifications(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'এসএমএস আউটবক্স লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRetry = async (id: number) => {
    try {
      await paymentsApi.retryNotification(id);
      alert('এসএমএস পুনরায় প্রেরণের অনুরোধ সম্পন্ন হয়েছে।');
      fetchNotifications();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'পুনরায় প্রেরণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">অভিভাবক এসএমএস আউটবক্স</h1>
        <p className="text-xs text-gray-500 mt-1">
          নগদ টাকা জমা হওয়ার পর অভিভাবকদের নিকট প্রেরিত মানি রসিদ এসএমএস ও ডেলিভারি স্ট্যাটাস
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">আইডি</th>
                <th className="px-4 py-3">শিক্ষার্থী</th>
                <th className="px-4 py-3">অভিভাবক</th>
                <th className="px-4 py-3">মাস্কড ফোন নম্বর</th>
                <th className="px-4 py-3">বার্তা প্রিভিউ</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3">প্রচেষ্টা</th>
                <th className="px-4 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">লোড হচ্ছে...</td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">কোনো বার্তা নেই</td></tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{n.id}</td>
                    <td className="px-4 py-3">{n.student?.name_bn || n.student?.name_en}</td>
                    <td className="px-4 py-3">{n.recipient_name}</td>
                    <td className="px-4 py-3 font-mono font-medium">{n.recipient_phone_masked || 'ফোন নম্বর নেই'}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={n.message_preview || ''}>
                      {n.message_preview}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.status === 'SENT' || n.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        n.status === 'QUEUED' ? 'bg-blue-100 text-blue-800' :
                        n.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{n.attempt_count}/{n.max_attempts}</td>
                    <td className="px-4 py-3 text-right">
                      {n.status === 'FAILED' && n.attempt_count < n.max_attempts && (
                        <button
                          onClick={() => handleRetry(n.id)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded text-[10px] font-semibold hover:bg-amber-100"
                        >
                          পুনরায় পাঠান
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
    </div>
  );
};
