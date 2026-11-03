import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';

export const PaymentReceiptPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Payment ID or Receipt ID
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReprintModal, setShowReprintModal] = useState(false);
  const [reprintReason, setReprintReason] = useState('');
  const [reprinting, setReprinting] = useState(false);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getReceiptPrintPayload(parseInt(id!, 10));
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'মানি রসিদ লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReceipt();
  }, [id]);

  const handleReprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reprintReason.trim()) return;

    try {
      setReprinting(true);
      await paymentsApi.reprintReceipt(parseInt(id!, 10), reprintReason.trim());
      setShowReprintModal(false);
      setReprintReason('');
      await fetchReceipt();
      window.print();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'পুনর্মুদ্রণ অডিট রেকর্ড করতে ব্যর্থ হয়েছে।');
    } finally {
      setReprinting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">অফিসিয়াল মানি রসিদ প্রস্তুত হচ্ছে...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'রসিদ পাওয়া যায়নি।'}</p>
        <Link to="/app/payments" className="text-blue-600 underline text-sm">
          ড্যাশবোর্ডে ফিরে যান
        </Link>
      </div>
    );
  }

  const snapshot = data.snapshot || {};
  const student = snapshot.student || {};
  const isReversed = data.status === 'REVERSED';
  const isReprint = data.print_count > 1;

  const renderReceiptCopy = (copyTitle: string) => (
    <div className="border-2 border-emerald-900 p-6 rounded bg-white flex flex-col justify-between h-[135mm] box-border relative overflow-hidden">
      {/* Watermark for reversed receipts */}
      {isReversed && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-7xl font-extrabold text-red-600 rotate-[-25deg] uppercase">
            REVERSED / বাতিলকৃত
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-start border-b-2 border-emerald-900 pb-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-emerald-950">জামিয়া ইসলামিয়া মাদরাসা</h2>
            <p className="text-xs text-gray-600">হিসাব শাখা | অফিসিয়াল মানি রসিদ (Cash Receipt)</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {isReprint && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">
                  REPRINT / পুনর্মুদ্রণ
                </span>
              )}
              <span className="px-3 py-1 bg-emerald-900 text-white text-xs font-bold rounded uppercase">
                {copyTitle}
              </span>
            </div>
            <p className="font-mono text-xs font-bold text-gray-900 mt-1">রসিদ: {data.receipt_number}</p>
          </div>
        </div>

        {/* Confirmation Banner */}
        <div className="my-2 bg-emerald-50 border border-emerald-300 p-1.5 rounded text-center">
          <p className="text-[11px] font-bold text-emerald-900">
            ✓ এই রসিদ অর্থ গ্রহণের প্রমাণ। ভবিষ্যৎ প্রয়োজনে সংরক্ষণ করুন।
          </p>
        </div>

        {/* Meta details */}
        <div className="grid grid-cols-2 text-xs py-1 border-b border-gray-300 gap-2">
          <div>
            <p>
              <span className="font-semibold text-gray-700">শিক্ষার্থী:</span> {student.name_bn || student.name_en}
            </p>
            <p className="font-mono text-gray-600">
              <span className="font-semibold text-gray-700">আইডি:</span> {student.student_code}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono">
              <span className="font-semibold text-gray-700">ট্রানজ্যাকশন:</span> {snapshot.payment_reference}
            </p>
            <p className="font-mono text-gray-600">
              <span className="font-semibold text-gray-700">স্লিপ:</span> {snapshot.slip_number}
            </p>
          </div>
        </div>

        {/* Cash Breakdown */}
        <div className="mt-3 bg-gray-50 p-3 rounded border text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-gray-600">জমার পরিমাণ (Amount Received):</span>
            <span className="font-mono font-bold text-gray-900">৳{snapshot.amount_received}</span>
          </div>
          <div className="flex justify-between py-0.5 text-gray-500">
            <span>প্রদত্ত নগদ (Cash Tendered):</span>
            <span className="font-mono">৳{snapshot.cash_tendered}</span>
          </div>
          <div className="flex justify-between py-0.5 text-gray-500">
            <span>ফেরত দেওয়া হয়েছে (Change Returned):</span>
            <span className="font-mono">৳{snapshot.change_returned}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-400 pt-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="border border-gray-400 p-1 w-16 h-16 flex items-center justify-center text-[9px] text-gray-400 text-center font-mono">
              [QR কোড]
            </div>
            <div className="text-[10px] text-gray-500">
              <p>আদায়কারী: {snapshot.collected_by}</p>
              <p>কাউন্টার: {snapshot.counter_code}</p>
              <p>সময়: {new Date(snapshot.collected_at || Date.now()).toLocaleTimeString('bn-BD')}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-600">মোট প্রাপ্তি:</p>
            <p className="text-xl font-bold font-mono text-emerald-800">৳{data.receipt_amount}</p>
          </div>

          <div className="text-center w-36">
            <div className="border-b border-dashed border-gray-600 h-6"></div>
            <p className="text-[10px] text-gray-600 mt-1">ক্যাশিয়ারের স্বাক্ষর ও সিল</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg print:hidden">
        <Link to="/app/payments" className="text-sm text-gray-600 hover:underline">
          &larr; ড্যাশবোর্ডে ফিরে যান
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => setShowReprintModal(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 shadow"
          >
            পুনর্মুদ্রণ আবেদন (Reprint)
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow"
          >
            🖨 A4 দুই-কপি রসিদ প্রিন্ট
          </button>
        </div>
      </div>

      {/* A4 Sheet */}
      <div className="bg-white shadow-lg p-6 w-[210mm] min-h-[297mm] mx-auto space-y-4 print:shadow-none print:p-0 print:m-0">
        {renderReceiptCopy('অফিস কপি (Office Copy)')}

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 py-1">
          <span className="w-1/3 border-b-2 border-dashed border-gray-400"></span>
          <span>✂ এই দাগ বরাবর আলাদা করুন ✂</span>
          <span className="w-1/3 border-b-2 border-dashed border-gray-400"></span>
        </div>

        {renderReceiptCopy('শিক্ষার্থী কপি (Student Copy)')}
      </div>

      {/* Reprint Modal */}
      {showReprintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">মানি রসিদ পুনর্মুদ্রণ (Reprint Reason)</h3>
            <p className="text-xs text-gray-500">
              অডিট ট্রেইলের জন্য পুনর্মুদ্রণের কারণ লিপিবদ্ধ করা আবশ্যক।
            </p>
            <form onSubmit={handleReprintSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={reprintReason}
                onChange={(e) => setReprintReason(e.target.value)}
                placeholder="উদাহরণ: গ্রাহক কপি হারিয়ে গেছে / মূল প্রিন্টে কালি অস্পষ্ট..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReprintModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={reprinting || !reprintReason.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
                >
                  {reprinting ? 'রেকর্ড হচ্ছে...' : 'কারণ সংরক্ষণ ও প্রিন্ট'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

