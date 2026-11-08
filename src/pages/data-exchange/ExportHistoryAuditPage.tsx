import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ExportJobItem } from '../../types/dataExchange';

export const ExportHistoryAuditPage: React.FC = () => {
  const [exports, setExports] = useState<ExportJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dataExchangeApi.listExportJobs();
      setExports(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'এক্সপোর্ট ইতিহাস লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleDownload = async (job: ExportJobItem) => {
    try {
      setDownloadingId(job.id);
      const blob = await dataExchangeApi.downloadExportArtifact(job.id);
      const extension = job.format === 'PDF' ? 'pdf' : 'xlsx';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.dataset}_${job.tracking_code}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'ফাইল ডাউনলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('আপনি কি এই এক্সপোর্ট কাজটি বাতিল করতে চান?')) return;
    try {
      await dataExchangeApi.cancelExportJob(id);
      fetchExports();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'কাজ বাতিল করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">এক্সপোর্ট ইতিহাস ও অডিট</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">এক্সপোর্ট ইতিহাস ও ডাউনলোড অডিট</h1>
          <p className="text-xs text-gray-500 mt-1">
            তৈরিকৃত সকল এক্সেল ও পিডিএফ প্রতিবেদনের ট্র্যাকিং ও নিরাপদ ডাউনলোড পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExports}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/data-exchange/exports/new"
            className="px-4 py-2 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            + নতুন এক্সপোর্ট ফাইল
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Security Note Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <div>
          <strong>৭ দিনের স্বয়ংক্রিয় রিটেনশন নীতি:</strong> প্রাতিষ্ঠানিক ডেটা সুরক্ষায় সমস্ত জেনারেটকৃত ফাইল ৭ দিন পর স্বয়ংক্রিয়ভাবে মুছে যায়।
        </div>
      </div>

      {/* Exports Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900">এক্সপোর্ট তালিকার বিস্তারিত ({exports.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">এক্সপোর্ট তালিকা লোড হচ্ছে...</div>
        ) : exports.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">কোনো এক্সপোর্ট রেকর্ড পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3">ট্র্যাকিং কোড</th>
                  <th className="p-3">ডেটাসেট</th>
                  <th className="p-3">ফরম্যাট</th>
                  <th className="p-3">অবস্থা</th>
                  <th className="p-3">সারি সংখ্যা</th>
                  <th className="p-3">সাইজ (KB)</th>
                  <th className="p-3">তৈরির সময়</th>
                  <th className="p-3">মেয়াদ উত্তীর্ণ</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exports.map((exp) => {
                  const isReady = exp.status === 'READY';
                  const isProcessing = exp.status === 'PROCESSING' || exp.status === 'PENDING';
                  const isExpired = exp.status === 'EXPIRED';

                  return (
                    <tr key={exp.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-gray-900">{exp.tracking_code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{exp.dataset_name_bn || exp.dataset}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{exp.dataset}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
                          {exp.format === 'PDF' ? (
                            <FileText className="w-3 h-3 text-red-600" />
                          ) : (
                            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          )}
                          {exp.format}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : isProcessing
                              ? 'bg-blue-100 text-blue-800'
                              : isExpired
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">{exp.row_count}</td>
                      <td className="p-3 text-gray-500 font-mono">{exp.file_size_kb} KB</td>
                      <td className="p-3 text-gray-600">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-500">
                        {exp.expires_at ? new Date(exp.expires_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {isReady && exp.can_download && (
                          <button
                            onClick={() => handleDownload(exp)}
                            disabled={downloadingId === exp.id}
                            className="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded text-xs font-semibold transition"
                          >
                            {downloadingId === exp.id ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}
                          </button>
                        )}
                        {isProcessing && exp.can_cancel && (
                          <button
                            onClick={() => handleCancel(exp.id)}
                            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-semibold transition"
                          >
                            বাতিল
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
