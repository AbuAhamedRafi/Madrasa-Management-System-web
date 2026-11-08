import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  AlertCircle,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportTemplateInfo } from '../../types/dataExchange';

export const TemplateCatalogPage: React.FC = () => {
  const [templates, setTemplates] = useState<ImportTemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await dataExchangeApi.listTemplates();
        setTemplates(data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'টেমপ্লেট তালিকা লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleDownload = async (key: string, fileName: string) => {
    try {
      setDownloadingKey(key);
      const blob = await dataExchangeApi.downloadTemplate(key);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'টেমপ্লেট ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">টেমপ্লেট ক্যাটালগ</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">এক্সেল ইমপোর্ট টেমপ্লেট ক্যাটালগ</h1>
          <p className="text-xs text-gray-500 mt-1">
            সঠিক কাঠামোর স্ট্যান্ডার্ড ওপেনএক্সএমএল (.xlsx) টেমপ্লেট ডাউনলোড করে তথ্য সন্নিবেশ করুন
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/app/data-exchange/imports/new"
            className="px-4 py-2 bg-[#137C73] text-white rounded-lg text-sm font-medium hover:bg-[#0f645d] transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            ইমপোর্ট শুরু করুন
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Templates List & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">অনুমোদিত ইমপোর্ট টেমপ্লেটসমূহ</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500">টেমপ্লেট লোড হচ্ছে...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {templates.map((tpl) => (
                  <div key={tpl.key} className="p-5 hover:bg-gray-50 transition space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{tpl.name_bn}</h3>
                          <span className="text-xs text-gray-400">({tpl.name_en})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            {tpl.version}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{tpl.description_bn}</p>
                      </div>

                      <button
                        onClick={() => handleDownload(tpl.key, tpl.key)}
                        disabled={downloadingKey === tpl.key}
                        className="px-3.5 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        {downloadingKey === tpl.key ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড (.xlsx)'}
                      </button>
                    </div>

                    {/* Columns Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2 border border-gray-200">
                      <div>
                        <span className="font-semibold text-gray-700">আবশ্যক ফিল্ড: </span>
                        <span className="text-gray-600">
                          {tpl.required_columns.map((c) => c.label_bn).join(', ')}
                        </span>
                      </div>
                      {tpl.optional_columns.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-500">ঐচ্ছিক ফিল্ড: </span>
                          <span className="text-gray-500">
                            {tpl.optional_columns.map((c) => c.label_bn).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rules & Best Practices */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              টেমপ্লেট ব্যবহারের নির্দেশিকা
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-teal-50 border-l-4 border-teal-600 rounded">
                <p className="font-semibold text-teal-900">ওপেনএক্সএমএল ফরম্যাট</p>
                <p className="text-teal-800 mt-0.5">
                  শুধুমাত্র <code>.xlsx</code> এক্সটেনশনের ফাইল সমর্থিত। ম্যাক্রো-সংবলিত (<code>.xlsm</code>) ফাইল গৃহীত হবে না।
                </p>
              </div>

              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                <p className="font-semibold text-amber-900">শিক্ষার্থী আইডি ও ফোন নম্বর</p>
                <p className="text-amber-800 mt-0.5">
                  ফোন নম্বর ও আইডি ফিল্ডগুলোকে টেক্সট (Text) হিসেবে রাখুন, যাতে শুরুর শূন্য (০) বাদ না পড়ে।
                </p>
              </div>

              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-semibold text-blue-900">ডুপ্লিকেট সুরক্ষা</p>
                <p className="text-blue-800 mt-0.5">
                  একই ফোন নম্বর বা জন্ম নিবন্ধন নম্বর একাধিক সারিতে থাকলে সিস্টেম প্রিভিউতে ডুপ্লিকেট নির্দেশ করবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
