import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  FileSpreadsheet,
  History,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { promotionsApi } from '../../services/promotionsApi';
import type { PromotionBatch, PromotionItem } from '../../types/promotions';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('bn') ? 'bn' : 'en';

  const [batch, setBatch] = useState<PromotionBatch | null>(null);
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedTargetSectionId, setSelectedTargetSectionId] = useState<number | ''>('');

  const fetchBatchAndItems = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const batchData = await promotionsApi.getBatch(Number(id));
      setBatch(batchData);

      const itemsRes = await promotionsApi.listItems(Number(id), { per_page: 50 });
      setItems(itemsRes.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load batch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchAndItems();
  }, [id]);

  const handleRunPreview = async () => {
    if (!batch) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await promotionsApi.previewBatch(batch.id);
      setSuccessMsg(language === 'bn' ? 'প্রিভিউ মূল্যায়ন সম্পন্ন হয়েছে।' : 'Batch preview evaluation completed.');
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Preview failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!batch) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await promotionsApi.executeBatch(batch.id);
      setSuccessMsg(language === 'bn' ? 'ব্যাচ কার্যকরকরণ প্রক্রিয়া শুরু হয়েছে।' : 'Batch execution started.');
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Execution failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!batch) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await promotionsApi.pauseBatch(batch.id);
      setSuccessMsg(language === 'bn' ? 'ব্যাচ স্থগিত করা হয়েছে।' : 'Batch paused successfully.');
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Pause failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!batch) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await promotionsApi.resumeBatch(batch.id);
      setSuccessMsg(language === 'bn' ? 'ব্যাচ পুনরায় চালু করা হয়েছে।' : 'Batch resumed successfully.');
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Resume failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!batch) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await promotionsApi.retryBatch(batch.id);
      setSuccessMsg(language === 'bn' ? 'ব্যর্থ শিক্ষার্থীদের জন্য পুনরায় চেষ্টা শুরু হয়েছে।' : 'Retry executed.');
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Retry failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!batch) return;
    if (!confirm(language === 'bn' ? 'আপনি কি এই শিক্ষার্থীকে ব্যাচ থেকে সরাতে চান?' : 'Remove student from batch?')) {
      return;
    }
    try {
      await promotionsApi.removeItem(batch.id, itemId);
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to remove item');
    }
  };

  const handleSaveSection = async (itemId: number) => {
    if (!batch || !selectedTargetSectionId) return;
    try {
      await promotionsApi.updateItem(batch.id, itemId, {
        target_offering_section_id: Number(selectedTargetSectionId),
      });
      setEditingItemId(null);
      fetchBatchAndItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update section');
    }
  };

  const total = batch?.total_items || items.length;
  const succeeded = batch?.succeeded_items || items.filter((i) => i.status === 'SUCCEEDED').length;
  const failed = batch?.failed_items || items.filter((i) => i.status === 'FAILED').length;
  const progressPct = total > 0 ? Math.round((succeeded / total) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to="/app/promotions"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{batch?.batch_number || 'Batch Details'}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {batch?.mode}
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {batch?.action}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {batch?.source_academic_period?.label} ➔ {batch?.target_academic_period?.label} (
              {batch?.target_academic_offering?.program_class?.name_en})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {batch && ['DRAFT', 'PREVIEWED'].includes(batch.status) && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRunPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('btn_run_preview')}</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecute}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{t('btn_execute_batch')}</span>
              </button>
            </>
          )}

          {batch && batch.status === 'RUNNING' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              <span>{t('btn_pause_batch')}</span>
            </button>
          )}

          {batch && batch.status === 'PAUSED' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleResume}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{t('btn_resume_batch')}</span>
            </button>
          )}

          {batch && batch.status === 'COMPLETED_WITH_ERRORS' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('btn_retry_failed')}</span>
            </button>
          )}

          {batch && (
            <>
              <a
                href={promotionsApi.getExportUrl(batch.id)}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{t('btn_export_csv')}</span>
              </a>
              <Link
                to={`/app/promotions/batches/${batch.id}/audit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>{language === 'bn' ? 'অডিট ইতিহাস' : 'Audit Trail'}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Progress & Counters Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'কার্যকরকরণ অগ্রগতি' : 'Execution Progress'}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-800">{progressPct}%</span>
              <span className="text-xs text-slate-500">
                ({succeeded} / {total} {language === 'bn' ? 'সম্পন্ন' : 'Succeeded'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
              {language === 'bn' ? 'মোট:' : 'Total:'} {total}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              {language === 'bn' ? 'সফল:' : 'Succeeded:'} {succeeded}
            </span>
            <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              {language === 'bn' ? 'ব্যর্থ:' : 'Failed:'} {failed}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
          <div style={{ width: `${progressPct}%` }} className="h-full bg-emerald-500 transition-all duration-300" />
          {failed > 0 && (
            <div
              style={{ width: `${Math.round((failed / total) * 100)}%` }}
              className="h-full bg-rose-500 transition-all duration-300"
            />
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {language === 'bn' ? 'ব্যাচভুক্ত শিক্ষার্থীদের তালিকা' : 'Enrolled Student Items'}
          </h2>
          <span className="text-xs text-slate-500">
            {items.length} {language === 'bn' ? 'জন শিক্ষার্থী' : 'Students'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{language === 'bn' ? 'শিক্ষার্থী' : 'Student'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'উৎস শ্রেণি' : 'Source Stage'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'লক্ষ্য শাখা' : 'Target Section'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-4">{language === 'bn' ? 'ত্রুটি বার্তা' : 'Error Notes'}</th>
                {batch && ['DRAFT', 'PREVIEWED'].includes(batch.status) && (
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {language === 'bn' ? item.student?.name_bn || item.student?.name_en : item.student?.name_en}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">ID: {item.student?.student_id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800">
                      {item.source_enrollment?.offering?.program_class?.name_en} (
                      {item.source_enrollment?.section?.code})
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedTargetSectionId}
                          onChange={(e) => setSelectedTargetSectionId(Number(e.target.value))}
                          className="text-xs border border-slate-200 rounded p-1 bg-white"
                        >
                          {batch?.target_academic_offering?.sections?.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.code} (Cap: {sec.capacity})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveSection(item.id)}
                          className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {item.target_offering_section?.code}
                        </span>
                        {batch && ['DRAFT', 'PREVIEWED'].includes(batch.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setSelectedTargetSectionId(item.target_offering_section_id);
                            }}
                            className="text-slate-400 hover:text-teal-600"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'SUCCEEDED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.status === 'ELIGIBLE'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-xs text-rose-600 max-w-xs truncate">
                    {item.safe_error_message || item.error_code || '-'}
                  </td>

                  {batch && ['DRAFT', 'PREVIEWED'].includes(batch.status) && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
