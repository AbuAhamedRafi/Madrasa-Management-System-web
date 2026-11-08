import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowLeft,
  RefreshCw,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportJobDetail } from '../../types/dataExchange';

export const ImportExecutionMonitorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || '0', 10);

  const [job, setJob] = useState<ImportJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await dataExchangeApi.getImportJob(jobId);
      setJob(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'কাজের বিবরণ লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    // Poll every 3 seconds if job is currently running
    const interval = setInterval(() => {
      if (job?.status === 'COMMITTING' || job?.status === 'VALIDATING') {
        fetchJob();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  const handleDownloadResult = async () => {
    if (!jobId) return;
    try {
      setDownloading(true);
      const blob = await dataExchangeApi.downloadImportResultFile(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import_result_${job?.tracking_code || jobId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'ফলাফল ফাইল ডাউনলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setDownloading(false);
    }
  };

  const isCompleted = job?.status === 'COMPLETED';
  const isFailed = job?.status === 'FAILED';

  const progressPercent = job?.total_rows
    ? Math.round(((job.committed_rows + job.failed_rows) / job.total_rows) * 100)
    : isCompleted
    ? 100
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">ইমপোর্ট অগ্রগতি ও ফলাফল (কাজ #{jobId})</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isFailed
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {job?.status || 'প্রক্রিয়াকরণ...'}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xs font-mono text-gray-500">{job?.tracking_code}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">ইমপোর্ট প্রক্রিয়াকরণ ও চূড়ান্ত ফলাফল</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            মূল ফাইল: <span className="font-semibold text-gray-700">{job?.original_file_name}</span> · মোড:{' '}
            <span className="font-semibold text-gray-700">{job?.mode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJob}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/data-exchange"
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            ড্যাশবোর্ডে ফিরুন
          </Link>
          {isCompleted && (
            <button
              onClick={handleDownloadResult}
              disabled={downloading}
              className="px-5 py-2 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'ডাউনলোড হচ্ছে...' : 'ফলাফল ফাইল ডাউনলোড (.xlsx)'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar & Hero Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-gray-700">কমিট অগ্রগতি:</span>
          <span className="font-bold text-teal-800">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isFailed ? 'bg-red-500' : isCompleted ? 'bg-emerald-600' : 'bg-teal-600 animate-pulse'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isCompleted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">ইমপোর্ট সফলভাবে ডাটাবেজে চূড়ান্তভাবে সংরক্ষিত হয়েছে!</p>
              <p className="text-emerald-700 mt-0.5">
                প্রতিটি নতুন শিক্ষার্থীর জন্য সার্ভার হতে প্রাতিষ্ঠানিক স্থায়ী আইডি বরাদ্দ করা হয়েছে।
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">ইমপোর্ট সম্পন্ন করা সম্ভব হয়নি।</p>
              <p className="text-red-700 mt-0.5">{job?.failure_reason || 'অপ্রত্যাশিত ত্রুটির কারণে কাজ বাতিল হয়েছে।'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500">মোট সারি</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{job?.total_rows ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-emerald-700 font-semibold">সফলভাবে কমিটকৃত</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{job?.committed_rows ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-red-700 font-semibold">ব্যর্থ সারি</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{job?.failed_rows ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500">ফাইল এক্সপায়ারি</div>
          <div className="text-sm font-semibold text-gray-700 mt-2">
            {job?.expires_at ? new Date(job.expires_at).toLocaleDateString() : '৭ দিন'}
          </div>
        </div>
      </div>

      {/* Audit Trail for the Job */}
      {job?.audit_logs && job.audit_logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            অডিট ট্রেইল ও কার্যক্রমের ইতিহাস
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3">সময়</th>
                  <th className="p-3">পদক্ষেপ</th>
                  <th className="p-3">ব্যবহারকারী</th>
                  <th className="p-3">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {job.audit_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{log.action}</td>
                    <td className="p-3 text-gray-700">{log.user?.name || 'System'}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
