import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportRowItem, ImportValidationPreviewResponse } from '../../types/dataExchange';

export const ImportValidationPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = parseInt(id || '0', 10);

  const [previewData, setPreviewData] = useState<ImportValidationPreviewResponse | null>(null);
  const [rows, setRows] = useState<ImportRowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadValidation = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await dataExchangeApi.validateAndPreview(jobId);
      setPreviewData(res);
      setRows(res.rows || []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'প্রিভিউ ভ্যালিডেশন লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidation();
  }, [jobId]);

  const handleCommit = async () => {
    if (!previewData?.preview_token) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই ভ্যালিডেটেড ডেটা ডাটাবেজে চূড়ান্তভাবে সংরক্ষণ করতে চান?')) {
      return;
    }
    try {
      setCommitting(true);
      setError(null);
      await dataExchangeApi.commitImport(jobId, previewData.preview_token);
      navigate(`/app/data-exchange/imports/${jobId}/run`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'কমিট করতে ব্যর্থ হয়েছে।');
    } finally {
      setCommitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('আপনি কি এই ইমপোর্ট কাজটি বাতিল করতে চান?')) return;
    try {
      setCancelling(true);
      await dataExchangeApi.cancelImport(jobId);
      navigate('/app/data-exchange');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'কাজ বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setCancelling(false);
    }
  };

  const filteredRows = rows.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <Link to={`/app/data-exchange/imports/new?resume=${jobId}`} className="hover:text-teal-700">
          ম্যাপিং
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">ভ্যালিডেশন প্রিভিউ (কাজ #{jobId})</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              জিরো-মিউটেশন ড্রাই-রান
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xs font-mono text-gray-500">JOB-{jobId}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">ডেটা যাচাই ও সিমুলেশন প্রিভিউ</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            ডাটাবেজে কোনো পরিবর্তন না করে প্রতিটি সারির ফিল্ড নিয়ম, ডুপ্লিকেট ও রেফারেন্স যাচাই করা হয়েছে
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadValidation}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            title="পুনরায় যাচাই"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling || committing}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition"
          >
            বাতিল করুন
          </button>
          {previewData?.summary.duplicate && previewData.summary.duplicate > 0 ? (
            <Link
              to={`/app/data-exchange/imports/${jobId}/review`}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition flex items-center gap-1.5"
            >
              ডুপ্লিকেট সমাধান করুন ({previewData.summary.duplicate})
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null}
          <button
            onClick={handleCommit}
            disabled={
              committing ||
              loading ||
              !previewData?.preview_token ||
              (previewData?.summary.invalid ?? 0) > 0 ||
              (previewData?.summary.duplicate ?? 0) > 0
            }
            className="px-5 py-2 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {committing ? 'সংরক্ষণ হচ্ছে...' : 'কমিট সম্পন্ন করুন'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Token Banner */}
      {previewData?.preview_token && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>ক্রিপ্টোগ্রাফিক প্রিভিউ টোকেন সক্রিয়:</span>
            <code className="bg-emerald-100 px-2 py-0.5 rounded font-mono text-emerald-800 text-[11px]">
              {previewData.preview_token.substring(0, 24)}...
            </code>
          </div>
          <span className="text-emerald-700 text-[11px]">ম্যাপিং অপরিবর্তিত থাকলে ৩০ মিনিট বৈধ</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === 'ALL' ? 'border-teal-500 bg-teal-50/50 shadow-sm' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-xs text-gray-500">মোট সারি</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{previewData?.summary.total || 0}</div>
        </button>

        <button
          onClick={() => setStatusFilter('VALID')}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === 'VALID' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-xs text-emerald-700 font-semibold">সঠিক (Valid)</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{previewData?.summary.valid || 0}</div>
        </button>

        <button
          onClick={() => setStatusFilter('INVALID')}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === 'INVALID' ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-xs text-red-700 font-semibold">ত্রুটিপূর্ণ (Invalid)</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{previewData?.summary.invalid || 0}</div>
        </button>

        <button
          onClick={() => setStatusFilter('DUPLICATE')}
          className={`p-4 rounded-xl border text-left transition ${
            statusFilter === 'DUPLICATE' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-xs text-amber-700 font-semibold">ডুপ্লিকেট (Review)</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{previewData?.summary.duplicate || 0}</div>
        </button>
      </div>

      {/* Rows Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600" />
            সারির বিস্তারিত ফলাফল ({filteredRows.length} সারি)
          </h2>
          <span className="text-xs text-gray-500">ফিল্টার: {statusFilter}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">যাচাই তথ্য লোড হচ্ছে...</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">এই ফিল্টারে কোনো সারি নেই।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3 w-16 text-center">সারি #</th>
                  <th className="p-3 w-28">অবস্থা</th>
                  <th className="p-3">শিক্ষার্থীর নাম</th>
                  <th className="p-3">লিঙ্গ ও জন্ম তারিখ</th>
                  <th className="p-3">অভিভাবক ও ফোন</th>
                  <th className="p-3">যাচাই ফলাফল ও ত্রুটি বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((row) => {
                  const p = row.parsed_payload || row.raw_payload || {};
                  const hasErrors = Object.keys(row.errors || {}).length > 0;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 ${
                        row.status === 'INVALID'
                          ? 'bg-red-50/30'
                          : row.status === 'DUPLICATE'
                          ? 'bg-amber-50/30'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-bold text-gray-700">
                        {row.row_number}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.status === 'VALID' || row.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'INVALID'
                              ? 'bg-red-100 text-red-800'
                              : row.status === 'DUPLICATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{p.name_bn || '—'}</div>
                        <div className="text-[11px] text-gray-400">{p.name_en || ''}</div>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div>{p.gender || '—'}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{p.dob || ''}</div>
                      </td>
                      <td className="p-3 text-gray-700">
                        <div>{p.primary_guardian?.name_bn || p['primary_guardian.name_bn'] || '—'}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {p.primary_guardian?.phone || p['primary_guardian.phone'] || ''}
                        </div>
                      </td>
                      <td className="p-3">
                        {hasErrors ? (
                          <div className="space-y-1">
                            {Object.entries(row.errors).map(([field, msg]) => (
                              <div key={field} className="text-red-700 text-[11px] flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  <strong>{field}:</strong> {msg}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : row.status === 'DUPLICATE' ? (
                          <div className="text-amber-800 text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>সম্ভাব্য ডুপ্লিকেট শিক্ষার্থী চিহ্নিত হয়েছে (রিভিউ প্রয়োজন)</span>
                          </div>
                        ) : (
                          <div className="text-emerald-700 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>যাচাই সফল</span>
                          </div>
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
