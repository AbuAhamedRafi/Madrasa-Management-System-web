import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Lock,
  Eye,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type {
  ExportDatasetInfo,
  ExportColumnDefinition,
  ExportFormat,
  ExportPreviewResult,
} from '../../types/dataExchange';

export const DatasetExportBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState<ExportDatasetInfo[]>([]);
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string>('');
  const [columns, setColumns] = useState<ExportColumnDefinition[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>('XLSX');
  const [locale, setLocale] = useState<'bn' | 'en'>('bn');

  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Preview state
  const [previewResult, setPreviewResult] = useState<ExportPreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const data = await dataExchangeApi.listExportDatasets();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetKey(data[0].key);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'ডেটাসেট তালিকা লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (!selectedDatasetKey) return;
    const fetchColumns = async () => {
      try {
        setError(null);
        const res = await dataExchangeApi.getDatasetColumns(selectedDatasetKey);
        setColumns(res.columns);
        // By default select all allowed columns
        const defaultSelected = res.columns
          .filter((c) => c.sensitivity !== 'RESTRICTED')
          .map((c) => c.key);
        setSelectedColumns(defaultSelected);
        setPreviewResult(null);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'কলাম স্কিমা লোড করতে ব্যর্থ হয়েছে।');
      }
    };
    fetchColumns();
  }, [selectedDatasetKey]);

  const buildFilters = () => {
    const f: Record<string, any> = {};
    if (dateFrom) f.date_from = dateFrom;
    if (dateTo) f.date_to = dateTo;
    return f;
  };

  const handlePreviewDryRun = async () => {
    if (!selectedDatasetKey || selectedColumns.length === 0) return;
    try {
      setPreviewing(true);
      setError(null);
      const res = await dataExchangeApi.previewExport({
        dataset: selectedDatasetKey,
        columns: selectedColumns,
        filters: buildFilters(),
        format,
      });
      setPreviewResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'এক্সপোর্ট প্রিভিউ করতে সমস্যা হয়েছে।');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreateExport = async () => {
    if (!selectedDatasetKey || selectedColumns.length === 0) return;
    try {
      setCreating(true);
      setError(null);
      await dataExchangeApi.createExportJob({
        dataset: selectedDatasetKey,
        columns: selectedColumns,
        filters: buildFilters(),
        format,
        locale,
      });
      navigate('/app/data-exchange/exports');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'এক্সপোর্ট তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    const allowed = columns.filter((c) => c.sensitivity !== 'RESTRICTED').map((c) => c.key);
    setSelectedColumns(allowed);
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">নতুন ডেটাসেট এক্সপোর্ট বিল্ডার</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">কাস্টম ডেটাসেট এক্সপোর্ট বিল্ডার</h1>
          <p className="text-xs text-gray-500 mt-1">
            অনুমোদিত ডেটাসেট ও নির্দিষ্ট কলাম নির্বাচন করে এক্সেল (.xlsx) অথবা পিডিএফ (.pdf) তৈরি করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/data-exchange/exports"
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            এক্সপোর্ট হিস্ট্রি দেখুন
          </Link>
          <button
            type="button"
            onClick={handleCreateExport}
            disabled={creating || selectedColumns.length === 0}
            className="px-5 py-2 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {creating ? 'জেনারেট হচ্ছে...' : 'এক্সপোর্ট ফাইল তৈরি করুন'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dataset & Columns Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dataset Selector Tabs */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-gray-700">অনুমোদিত ডেটাসেট নির্বাচন করুন *</label>
            {loading ? (
              <div className="text-xs text-gray-400">ডেটাসেট লোড হচ্ছে...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {datasets.map((ds) => {
                  const isSelected = ds.key === selectedDatasetKey;
                  return (
                    <button
                      key={ds.key}
                      type="button"
                      onClick={() => setSelectedDatasetKey(ds.key)}
                      className={`p-3.5 rounded-lg border text-left transition ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900">{ds.name_bn}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{ds.key}</div>
                      <div className="text-[11px] text-gray-600 mt-1 line-clamp-1">{ds.description_bn}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Checkboxes */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">এক্সপোর্টযোগ্য কলাম তালিকা</h3>
                <p className="text-[11px] text-gray-500">
                  নির্বাচিত কলাম: {selectedColumns.length} / {columns.length}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllColumns}
                  className="px-2.5 py-1 text-teal-700 bg-teal-50 rounded hover:bg-teal-100 font-semibold"
                >
                  সব নির্বাচন
                </button>
                <button
                  type="button"
                  onClick={deselectAllColumns}
                  className="px-2.5 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-semibold"
                >
                  সব বাতিল
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {columns.map((col) => {
                const isRestricted = col.sensitivity === 'RESTRICTED';
                const isSensitive = col.sensitivity === 'SENSITIVE';
                const isChecked = selectedColumns.includes(col.key);

                return (
                  <label
                    key={col.key}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isRestricted
                        ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                        : isChecked
                        ? 'border-teal-500 bg-teal-50/30'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isRestricted}
                      checked={isChecked}
                      onChange={() => toggleColumn(col.key)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <span>{col.name_bn}</span>
                        {isRestricted && (
                          <span title="অ্যাক্সেস সংরক্ষিত">
                            <Lock className="w-3 h-3 text-red-500" />
                          </span>
                        )}
                        {isSensitive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800">
                            সংবেদনশীল
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {col.key} ({col.type})
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Options & Dry-Run Preview Estimation */}
        <div className="space-y-6">
          {/* Format & Locale Selection */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">এক্সপোর্ট ফরম্যাট ও ভাষা</h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">ফাইল ফরম্যাট *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('XLSX')}
                  className={`p-3 rounded-lg border text-center text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    format === 'XLSX'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('PDF')}
                  className={`p-3 rounded-lg border text-center text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    format === 'PDF'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF (.pdf)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">হেডার ভাষা</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocale('bn')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                    locale === 'bn' ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-gray-200'
                  }`}
                >
                  বাংলা (Bengali)
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                    locale === 'en' ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-gray-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Date Filters */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <label className="block text-xs font-bold text-gray-700">তারিখ রেঞ্জ ফিল্টার (ঐচ্ছিক)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500">হতে:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">পর্যন্ত:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dry Run Preview Box */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-600" />
                ড্রাই-রান প্রাক-নিরীক্ষা
              </h3>
              <button
                type="button"
                onClick={handlePreviewDryRun}
                disabled={previewing || selectedColumns.length === 0}
                className="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded text-xs font-semibold transition"
              >
                {previewing ? 'যাচাই হচ্ছে...' : 'হিসাব করুন'}
              </button>
            </div>

            {previewResult ? (
              <div className="space-y-3 text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">অনুমানিত সারি সংখ্যা:</span>
                  <span className="font-bold text-gray-900">{previewResult.row_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অনুমানিত ফাইল সাইজ:</span>
                  <span className="font-bold text-gray-900">{previewResult.estimated_kb} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">নির্বাচিত কলাম:</span>
                  <span className="font-bold text-gray-900">{previewResult.columns_count} টি</span>
                </div>
                <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-200">
                  কাটঅফ সময়: {new Date(previewResult.cutoff_at).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
                'হিসাব করুন' বাটনে ক্লিক করে ফাইল সাইজ ও সারির পরিমাণ দেখুন।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
