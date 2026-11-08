import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  GitCompare,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportRowItem } from '../../types/dataExchange';

export const ImportDuplicateReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = parseInt(id || '0', 10);

  const [duplicateRows, setDuplicateRows] = useState<ImportRowItem[]>([]);
  const [resolutions, setResolutions] = useState<
    Record<number, { action: 'SKIP' | 'UPDATE' | 'CREATE_NEW' | 'OVERWRITE'; target_student_id?: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDuplicates = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await dataExchangeApi.getPreviewRows(jobId, { status: 'DUPLICATE' });
        setDuplicateRows(res.data);

        // Pre-populate default resolution: SKIP
        const initialResolutions: Record<number, any> = {};
        res.data.forEach((r) => {
          initialResolutions[r.row_number] = {
            action: (r.resolution as any) || 'SKIP',
            target_student_id: r.matched_student_id || undefined,
          };
        });
        setResolutions(initialResolutions);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'ডুপ্লিকেট রেকর্ড লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchDuplicates();
  }, [jobId]);

  const handleActionChange = (
    rowNumber: number,
    action: 'SKIP' | 'UPDATE' | 'CREATE_NEW' | 'OVERWRITE',
    matchedId?: number | null
  ) => {
    setResolutions((prev) => ({
      ...prev,
      [rowNumber]: {
        action,
        target_student_id: matchedId || undefined,
      },
    }));
  };

  const handleApplyAll = (action: 'SKIP' | 'UPDATE' | 'CREATE_NEW') => {
    const updated: Record<number, any> = {};
    duplicateRows.forEach((r) => {
      updated[r.row_number] = {
        action,
        target_student_id: r.matched_student_id || undefined,
      };
    });
    setResolutions(updated);
  };

  const handleSaveResolutions = async () => {
    if (!jobId) return;
    try {
      setSaving(true);
      setError(null);
      await dataExchangeApi.resolveDuplicates(jobId, resolutions);
      // Re-validate and return to preview
      navigate(`/app/data-exchange/imports/${jobId}/preview`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'সিদ্ধান্ত সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
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
        <Link to={`/app/data-exchange/imports/${jobId}/preview`} className="hover:text-teal-700">
          প্রিভিউ (কাজ #{jobId})
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">ডুপ্লিকেট সংঘাত সমাধান</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              ডুপ্লিকেট রেজোলিউশন
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xs font-mono text-gray-500">JOB-{jobId}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">ডুপ্লিকেট শিক্ষার্থী সংঘাত ওয়ার্কবেঞ্চ</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            একই অভিভাবক ফোন, নাম বা জন্ম সনদ নম্বরের সাথে মিলে যাওয়া সারির জন্য উপযুক্ত সিদ্ধান্ত নির্বাচন করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/app/data-exchange/imports/${jobId}/preview`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            ← প্রিভিউতে ফিরে যান
          </Link>
          <button
            onClick={handleSaveResolutions}
            disabled={saving || loading || duplicateRows.length === 0}
            className="px-5 py-2 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত সংরক্ষণ ও পুনরায় যাচাই'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bulk Action Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-3 text-xs">
        <span className="font-semibold text-gray-700">
          মোট ডুপ্লিকেট সারি: <strong className="text-amber-800">{duplicateRows.length}</strong>
        </span>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">এক ক্লিকে প্রয়োগ:</span>
          <button
            onClick={() => handleApplyAll('SKIP')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold transition"
          >
            সব SKIP
          </button>
          <button
            onClick={() => handleApplyAll('UPDATE')}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-semibold transition"
          >
            সব UPDATE
          </button>
          <button
            onClick={() => handleApplyAll('CREATE_NEW')}
            className="px-3 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded font-semibold transition"
          >
            সব CREATE_NEW
          </button>
        </div>
      </div>

      {/* Duplicate Row Cards */}
      {loading ? (
        <div className="bg-white p-12 text-center text-xs text-gray-500 rounded-xl border border-gray-200">
          ডুপ্লিকেট সারি লোড হচ্ছে...
        </div>
      ) : duplicateRows.length === 0 ? (
        <div className="bg-white p-12 text-center text-xs text-emerald-700 rounded-xl border border-gray-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
          <p className="font-bold text-sm">কোনো অমীমাংসিত ডুপ্লিকেট সংঘাত নেই!</p>
          <p className="text-gray-500">আপনি নিরাপদে প্রিভিউ পৃষ্ঠা থেকে ডেটা কমিট করতে পারেন।</p>
          <Link
            to={`/app/data-exchange/imports/${jobId}/preview`}
            className="inline-block mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
          >
            প্রিভিউতে যান
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateRows.map((row) => {
            const incoming = row.parsed_payload || row.raw_payload || {};
            const matched = row.matched_student;
            const currentRes = resolutions[row.row_number]?.action || 'SKIP';

            return (
              <div
                key={row.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      সারি #{row.row_number}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{incoming.name_bn}</span>
                  </div>

                  {/* Resolution Radio / Pill Selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleActionChange(row.row_number, 'SKIP', row.matched_student_id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        currentRes === 'SKIP'
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      উপেক্ষা (SKIP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionChange(row.row_number, 'UPDATE', row.matched_student_id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        currentRes === 'UPDATE'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      হালনাগাদ (UPDATE)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionChange(row.row_number, 'CREATE_NEW', row.matched_student_id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        currentRes === 'CREATE_NEW'
                          ? 'bg-teal-700 text-white'
                          : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                      }`}
                    >
                      নতুন তৈরি (CREATE_NEW)
                    </button>
                  </div>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Incoming File Data */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      ইমপোর্ট ফাইলের তথ্য (ইনকামিং)
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <div>
                        <strong>নাম (বাংলা):</strong> {incoming.name_bn || '—'}
                      </div>
                      <div>
                        <strong>নাম (ইংরেজি):</strong> {incoming.name_en || '—'}
                      </div>
                      <div>
                        <strong>লিঙ্গ / জন্ম তারিখ:</strong> {incoming.gender || '—'} / {incoming.dob || '—'}
                      </div>
                      <div>
                        <strong>অভিভাবক:</strong>{' '}
                        {incoming.primary_guardian?.name_bn || incoming['primary_guardian.name_bn'] || '—'} (
                        {incoming.primary_guardian?.phone || incoming['primary_guardian.phone'] || '—'})
                      </div>
                      {incoming.birth_registration_number && (
                        <div>
                          <strong>জন্ম নিবন্ধন (BRC):</strong> {incoming.birth_registration_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Matched DB Record */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      ডাটাবেজে বিদ্যমান ম্যাচিং রেকর্ড
                    </div>
                    {matched ? (
                      <div className="space-y-1 text-gray-700">
                        <div>
                          <strong>শিক্ষার্থী আইডি:</strong>{' '}
                          <span className="font-mono font-bold text-teal-700">{matched.student_id}</span>
                        </div>
                        <div>
                          <strong>নাম:</strong> {matched.name_bn} ({matched.name_en})
                        </div>
                        <div>
                          <strong>অভিভাবক ফোন:</strong> {matched.phone || '—'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">সরাসরি শিক্ষার্থী রেকর্ড মেলানো যায়নি।</div>
                    )}
                  </div>
                </div>

                {/* Diff Preview if UPDATE */}
                {currentRes === 'UPDATE' && row.diff_payload && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <GitCompare className="w-3.5 h-3.5 text-blue-600" />
                      প্রত্যাশিত পরিবর্তনের পার্থক্য (Diff Preview):
                    </div>
                    <div className="space-y-1 text-blue-950 font-mono text-[11px]">
                      {Object.entries(row.diff_payload).map(([field, delta]: any) => (
                        <div key={field}>
                          <span className="font-bold">{field}:</span>{' '}
                          <span className="line-through text-red-600">{String(delta.old ?? 'empty')}</span> →{' '}
                          <span className="text-emerald-700 font-bold">{String(delta.new ?? '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
