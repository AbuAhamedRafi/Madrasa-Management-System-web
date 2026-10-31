import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  Eye,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { promotionsApi } from '../../services/promotionsApi';
import type { PromotionBatch } from '../../types/promotions';

export const PromotionDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('bn') ? 'bn' : 'en';
  const [batches, setBatches] = useState<PromotionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await promotionsApi.listBatches({
        page,
        per_page: 10,
        status: statusFilter || undefined,
        action: actionFilter || undefined,
        search: searchTerm || undefined,
      });
      setBatches(res.data);
      setTotalPages(res.last_page);
    } catch (err) {
      console.error('Failed to fetch promotion batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, statusFilter, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBatches();
  };

  const completedCount = batches.filter((b) => b.status === 'COMPLETED').length;
  const inProgressCount = batches.filter((b) => ['RUNNING', 'PREVIEWED', 'DRAFT'].includes(b.status)).length;
  const errorsCount = batches.filter((b) => b.status === 'COMPLETED_WITH_ERRORS').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {t(`batch_status_${status}`)}
          </span>
        );
      case 'COMPLETED_WITH_ERRORS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {t(`batch_status_${status}`)}
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {t(`batch_status_${status}`)}
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {t(`batch_status_${status}`)}
          </span>
        );
      case 'PREVIEWED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            {t(`batch_status_${status}`)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {t(`batch_status_${status}`)}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {language === 'bn' ? 'শিক্ষার্থী প্রমোশন ও বার্ষিক অগ্রগতি' : 'Student Promotions & Progression'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'একক বা বাল্ক ব্যাচে শিক্ষার্থীদের পরবর্তী শিক্ষাবর্ষ ও শ্রেণিতে উত্তীর্ণ করার সমন্বিত ড্যাশবোর্ড'
                  : 'Manage single student and bulk cohort academic progressions seamlessly'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/promotions/individual"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('nav_individual_promotion')}</span>
          </Link>
          <Link
            to="/app/promotions/batches/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-teal-700 text-white hover:bg-teal-800 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('nav_new_bulk_batch')}</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            {language === 'bn' ? 'মোট প্রমোশন ব্যাচ' : 'Total Batches'}
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{batches.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium">
            {language === 'bn' ? 'সম্পন্ন ব্যাচ' : 'Completed Batches'}
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{completedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-blue-600 font-medium">
            {language === 'bn' ? 'চলমান / প্রিভিউ' : 'In Progress / Preview'}
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{inProgressCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-amber-600 font-medium">
            {language === 'bn' ? 'ত্রুটিসহ সম্পন্ন (রিট্রাই যোগ্য)' : 'Completed with Errors'}
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{errorsCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ব্যাচ নম্বর দিয়ে খুঁজুন...' : 'Search by batch number...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">{language === 'bn' ? 'সকল অবস্থা' : 'All Statuses'}</option>
            <option value="DRAFT">{t('batch_status_DRAFT')}</option>
            <option value="PREVIEWED">{t('batch_status_PREVIEWED')}</option>
            <option value="RUNNING">{t('batch_status_RUNNING')}</option>
            <option value="PAUSED">{t('batch_status_PAUSED')}</option>
            <option value="COMPLETED">{t('batch_status_COMPLETED')}</option>
            <option value="COMPLETED_WITH_ERRORS">{t('batch_status_COMPLETED_WITH_ERRORS')}</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">{language === 'bn' ? 'সকল পদক্ষেপ' : 'All Actions'}</option>
            <option value="PROMOTE">{t('action_promote')}</option>
            <option value="REPEAT">{t('action_repeat')}</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">{language === 'bn' ? 'ব্যাচ নম্বর' : 'Batch #'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'উৎস শিক্ষাবর্ষ' : 'Source Period'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'লক্ষ্য শ্রেণি ও শিক্ষাবর্ষ' : 'Target Class & Period'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'শিক্ষার্থী সংখ্যা' : 'Students'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'ফলাফল' : 'Results'}</th>
                <th className="py-3.5 px-4">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'কার্যক্রম' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-6 h-6 mx-auto mb-2 animate-spin text-teal-600" />
                    <span>{language === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading batches...'}</span>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>{language === 'bn' ? 'কোন প্রমোশন ব্যাচ পাওয়া যায়নি' : 'No promotion batches found'}</span>
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{batch.batch_number}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {batch.mode}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-700">
                          {batch.action}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {batch.source_academic_period?.label || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {batch.source_offering_section
                          ? `${batch.source_offering_section.code}`
                          : language === 'bn'
                          ? 'সমগ্র শ্রেণি'
                          : 'Whole Grade'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {language === 'bn'
                          ? batch.target_academic_offering?.program_class?.name_bn
                          : batch.target_academic_offering?.program_class?.name_en || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {batch.target_academic_period?.label}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {batch.total_items ?? 0}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          ✓ {batch.succeeded_items ?? 0}
                        </span>
                        {(batch.failed_items ?? 0) > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-100">
                            ✕ {batch.failed_items}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(batch.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/app/promotions/batches/${batch.id}`}
                          title={language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {batch.status === 'COMPLETED_WITH_ERRORS' && (
                          <Link
                            to={`/app/promotions/batches/${batch.id}`}
                            title={language === 'bn' ? 'রিট্রাই করুন' : 'Retry Failed'}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Link>
                        )}
                        <a
                          href={promotionsApi.getExportUrl(batch.id)}
                          download
                          title={language === 'bn' ? 'সিএসভি এক্সপোর্ট' : 'Export CSV'}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              {language === 'bn'
                ? `পৃষ্ঠা ${page} এর ${totalPages}`
                : `Page ${page} of ${totalPages}`}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                {language === 'bn' ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
