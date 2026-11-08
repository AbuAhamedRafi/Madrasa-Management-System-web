import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportJobSummary, ExportJobItem } from '../../types/dataExchange';

export const DataExchangeDashboardPage: React.FC = () => {
  const [importJobs, setImportJobs] = useState<ImportJobSummary[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [importsRes, exportsRes] = await Promise.all([
        dataExchangeApi.listImportJobs({ per_page: 5 }),
        dataExchangeApi.listExportJobs({ per_page: 5 }),
      ]);
      setImportJobs(importsRes.data);
      setExportJobs(exportsRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ডেটা এক্সচেঞ্জ তথ্য লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalImports = importJobs.length;
  const needReview = importJobs.filter(
    (j) => j.status === 'PREVIEW_READY' && (j.duplicate_rows > 0 || j.invalid_rows > 0)
  ).length;
  const activeProcessing = importJobs.filter((j) =>
    ['VALIDATING', 'COMMITTING'].includes(j.status)
  ).length;
  const completedExports = exportJobs.filter((e) => e.status === 'READY').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              D08 ডেটা এক্সচেঞ্জ
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xs text-gray-500">ওপেনএক্সএমএল এক্সেল ইমপোর্ট, প্রিভিউ ও নিরাপদ এক্সপোর্ট</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">ডেটা ইমপোর্ট ও এক্সপোর্ট ড্যাশবোর্ড</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            শিক্ষার্থী ও একাডেমিক তথ্য নিরাপদে বাল্ক ইমপোর্ট করুন এবং আর্থিক ও শিক্ষার্থী খতিয়ান এক্সপোর্ট করুন
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/data-exchange/templates"
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            টেমপ্লেট ক্যাটালগ
          </Link>
          <Link
            to="/app/data-exchange/imports/new"
            className="px-4 py-2 bg-[#137C73] text-white rounded-lg text-sm font-medium hover:bg-[#0f645d] transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            নতুন ইমপোর্ট
          </Link>
          <Link
            to="/app/data-exchange/exports/new"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            নতুন এক্সপোর্ট
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-500 text-xs">
            <span>মোট সাম্প্রতিক ইমপোর্ট</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{totalImports}</div>
          <div className="text-xs text-gray-400 mt-1">কাজের খতিয়ান</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-500 text-xs">
            <span>যাচাই ও রিভিউ প্রয়োজন</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-2">{needReview}</div>
          <div className="text-xs text-amber-600 mt-1">ডুপ্লিকেট ও সংশোধনহীন রেকর্ড</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-500 text-xs">
            <span>চলমান প্রসেসিং কাজ</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{activeProcessing}</div>
          <div className="text-xs text-gray-400 mt-1">ভ্যালিডেশন ও কমিট কিউ</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-500 text-xs">
            <span>সম্পন্ন এক্সপোর্ট ফাইল</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{completedExports}</div>
          <div className="text-xs text-emerald-600 mt-1">ডাউনলোড প্রস্তুত</div>
        </div>
      </div>

      {/* Main Grid: Recent Jobs + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Imports & Exports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Import Jobs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-600" />
                সাম্প্রতিক ইমপোর্ট কাজ
              </h2>
              <Link
                to="/app/data-exchange/imports/new"
                className="text-xs text-teal-700 hover:underline font-medium"
              >
                + নতুন ইমপোর্ট
              </Link>
            </div>
            {importJobs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                কোনো ইমপোর্ট রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-3">ট্র্যাকিং কোড</th>
                      <th className="p-3">ফাইল</th>
                      <th className="p-3">মোড</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">রেকর্ড</th>
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-800 font-semibold">
                          {job.tracking_code}
                        </td>
                        <td className="p-3 text-gray-700 max-w-[150px] truncate" title={job.original_file_name}>
                          {job.original_file_name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {job.mode}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              job.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : job.status === 'PREVIEW_READY'
                                ? 'bg-amber-100 text-amber-800'
                                : job.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">
                          {job.total_rows} সারি
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {job.status === 'MAPPING_PENDING' && (
                            <Link
                              to={`/app/data-exchange/imports/new?resume=${job.id}`}
                              className="text-teal-700 hover:underline font-semibold"
                            >
                              ম্যাপিং
                            </Link>
                          )}
                          {job.status === 'PREVIEW_READY' && (
                            <Link
                              to={`/app/data-exchange/imports/${job.id}/preview`}
                              className="text-teal-700 hover:underline font-semibold"
                            >
                              প্রিভিউ
                            </Link>
                          )}
                          {job.status === 'COMPLETED' && (
                            <Link
                              to={`/app/data-exchange/imports/${job.id}/run`}
                              className="text-teal-700 hover:underline font-semibold"
                            >
                              ফলাফল
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Export Jobs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600" />
                সাম্প্রতিক এক্সপোর্ট কাজ
              </h2>
              <Link
                to="/app/data-exchange/exports"
                className="text-xs text-teal-700 hover:underline font-medium"
              >
                সব এক্সপোর্ট দেখুন →
              </Link>
            </div>
            {exportJobs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                কোনো এক্সপোর্ট রেকর্ড পাওয়া যায়নি।
              </div>
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
                      <th className="p-3 text-right">ডাউনলোড</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {exportJobs.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-800 font-semibold">
                          {exp.tracking_code}
                        </td>
                        <td className="p-3 text-gray-800 font-medium">
                          {exp.dataset}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {exp.format}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              exp.status === 'READY'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exp.status === 'PROCESSING'
                                ? 'bg-blue-100 text-blue-800'
                                : exp.status === 'EXPIRED'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{exp.row_count}</td>
                        <td className="p-3 text-right">
                          {exp.status === 'READY' ? (
                            <a
                              href={`/api/v1/export-jobs/${exp.id}/download`}
                              className="text-teal-700 hover:underline font-semibold"
                            >
                              ডাউনলোড
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Guidance & Security Rules */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              দ্রুত কাজের নির্দেশিকা
            </h3>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>নতুন শিক্ষার্থী:</strong> টেমপ্লেট ডাউনলোড করে পূরণ করুন। শিক্ষার্থী আইডি ফাঁকা রাখুন।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>শিক্ষার্থী আপডেট:</strong> বিদ্যমান শিক্ষার্থী আইডি মিলিয়ে শুধুমাত্র অনুমোদিত তথ্য হালনাগাদ করুন।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>আর্থিক খতিয়ান:</strong> হিসাবরক্ষকগণ সরাসরি অনুমোদিত ফিল্ডসহ লেজার এক্সপোর্ট করতে পারেন।
                </span>
              </li>
            </ul>

            <div className="pt-3 border-t border-gray-100">
              <Link
                to="/app/data-exchange/templates"
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-100 transition"
              >
                সব স্ট্যান্ডার্ড টেমপ্লেট দেখুন
              </Link>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              নিরাপত্তা ও প্রাতিষ্ঠানিক বিধিমালা
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              • শিক্ষার্থী আইডি কখনো এক্সেল ফাইলের মাধ্যমে নির্ধারণ করা যাবে না; এটি কেন্দ্রীয়ভাবে সার্ভার দ্বারা স্বয়ংক্রিয় বরাদ্দ হয়।
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              • এক্সেল ইমপোর্ট দ্বারা কোনো পেমেন্ট বা ক্যাশিয়ার ট্রানজ্যাকশন সরাসরি রেকর্ড করা সম্পূর্ণ নিষিদ্ধ।
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              • প্রতিটি এক্সপোর্ট ফাইল ৭ দিন পর স্বয়ংক্রিয়ভাবে মেয়াদোত্তীর্ণ হয়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
