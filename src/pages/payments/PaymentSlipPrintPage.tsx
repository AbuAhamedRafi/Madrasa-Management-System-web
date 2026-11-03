import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentsApi } from '../../services/paymentsApi';

export const PaymentSlipPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayload = async () => {
      try {
        setLoading(true);
        const res = await paymentsApi.getSlipPrintPayload(parseInt(id!, 10));
        setData(res);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'স্লিপ প্রিন্ট ডাটা লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPayload();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">প্রিন্ট কপি তৈরি হচ্ছে...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'ডাটা পাওয়া যায়নি।'}</p>
        <Link to="/app/payments" className="text-blue-600 underline text-sm">
          ড্যাশবোর্ডে ফিরে যান
        </Link>
      </div>
    );
  }

  const snapshot = data.snapshot || {};
  const student = snapshot.student || {};
  const invoice = snapshot.invoice || {};
  const items = snapshot.items || [];

  const renderSlipCopy = (copyTitle: string) => (
    <div className="border-2 border-gray-800 p-6 rounded bg-white flex flex-col justify-between h-[135mm] box-border relative">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">জামিয়া ইসলামিয়া মাদরাসা</h2>
            <p className="text-xs text-gray-600">হিসাব ও ক্যাশ কালেকশন বিভাগ | পেমেন্ট স্লিপ</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded uppercase">
              {copyTitle}
            </span>
            <p className="font-mono text-xs font-bold text-gray-900 mt-1">স্লিপ: {data.slip_number}</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="my-2 bg-amber-50 border border-amber-300 p-1.5 rounded text-center">
          <p className="text-[11px] font-bold text-amber-900">
            ⚠ সতর্কতা: এই স্লিপ টাকা জমার প্রমাণ নয়। ক্যাশ কাউন্টারে অর্থ পরিশোধের পর অফিসিয়াল রসিদ সংগ্রহ করুন।
          </p>
        </div>

        {/* Student & Invoice Meta */}
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
              <span className="font-semibold text-gray-700">ইনভয়েস:</span> {invoice.invoice_number}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">মেয়াদ:</span> {data.expires_at || 'অনির্দিষ্ট'}
            </p>
          </div>
        </div>

        {/* Item Table */}
        <div className="mt-2">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-gray-400 font-semibold text-gray-800">
                <th className="py-1">খাতের বিবরণ</th>
                <th className="py-1 text-center">শর্ত</th>
                <th className="py-1 text-right">বকেয়া</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 4).map((it: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1 font-medium">{it.name}</td>
                  <td className="py-1 text-center text-[10px]">
                    {it.admission_required ? 'ভর্তি আবশ্যক' : 'সাধারণ'}
                  </td>
                  <td className="py-1 text-right font-mono">৳{it.balance_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer & QR */}
      <div className="border-t border-gray-400 pt-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="border border-gray-400 p-1 w-16 h-16 flex items-center justify-center text-[9px] text-gray-400 text-center font-mono">
              [QR কোড]
            </div>
            <div className="text-[10px] text-gray-500">
              <p>টোকেন হ্যাশ:</p>
              <p className="font-mono text-[9px] truncate w-40">{data.verification_token_hash?.substring(0, 16)}...</p>
              <p>প্রিন্ট সংখ্যা: {data.print_count}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-600">জমার নির্ধারিত পরিমাণ:</p>
            <p className="text-lg font-bold font-mono text-gray-900">৳{data.slip_amount}</p>
          </div>

          <div className="text-center w-36">
            <div className="border-b border-dashed border-gray-600 h-6"></div>
            <p className="text-[10px] text-gray-600 mt-1">ইস্যুকারীর স্বাক্ষর ও সিল</p>
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
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow"
        >
          🖨 A4 দুই-কপি প্রিন্ট করুন
        </button>
      </div>

      {/* Single A4 Portrait Sheet Container */}
      <div className="bg-white shadow-lg p-6 w-[210mm] min-h-[297mm] mx-auto space-y-4 print:shadow-none print:p-0 print:m-0">
        {/* Office Copy (অফিস কপি) */}
        {renderSlipCopy('অফিস কপি (Office Copy)')}

        {/* Centered Cut Line */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 py-1">
          <span className="w-1/3 border-b-2 border-dashed border-gray-400"></span>
          <span>✂ এই দাগ বরাবর আলাদা করুন ✂</span>
          <span className="w-1/3 border-b-2 border-dashed border-gray-400"></span>
        </div>

        {/* Student Copy (শিক্ষার্থী কপি) */}
        {renderSlipCopy('শিক্ষার্থী কপি (Student Copy)')}
      </div>
    </div>
  );
};

