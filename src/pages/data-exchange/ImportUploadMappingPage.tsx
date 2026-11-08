import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  ArrowRight,
  AlertTriangle,
  Table,
} from 'lucide-react';
import { dataExchangeApi } from '../../services/dataExchangeApi';
import type { ImportMode } from '../../types/dataExchange';

const SYSTEM_FIELDS: Array<{ key: string; label: string; group: string; required?: boolean }> = [
  { key: 'name_bn', label: 'শিক্ষার্থীর নাম (বাংলা)', group: 'Student', required: true },
  { key: 'name_en', label: 'শিক্ষার্থীর নাম (ইংরেজি)', group: 'Student', required: true },
  { key: 'gender', label: 'লিঙ্গ (MALE / FEMALE)', group: 'Student', required: true },
  { key: 'dob', label: 'জন্ম তারিখ (YYYY-MM-DD)', group: 'Student', required: true },
  { key: 'blood_group', label: 'রক্তের গ্রুপ', group: 'Student' },
  { key: 'birth_registration_number', label: 'জন্ম নিবন্ধন নম্বর (BRC)', group: 'Student' },
  { key: 'primary_guardian.name_bn', label: 'অভিভাবকের নাম (বাংলা)', group: 'Guardian', required: true },
  { key: 'primary_guardian.name_en', label: 'অভিভাবকের নাম (ইংরেজি)', group: 'Guardian' },
  { key: 'primary_guardian.phone', label: 'অভিভাবকের ফোন নম্বর', group: 'Guardian', required: true },
  { key: 'primary_guardian.relationship', label: 'অভিভাবকের সম্পর্ক (FATHER / MOTHER / OTHER)', group: 'Guardian', required: true },
  { key: 'present_address', label: 'বর্তমান ঠিকানা', group: 'Address' },
  { key: 'permanent_address', label: 'স্থায়ী ঠিকানা', group: 'Address' },
  { key: 'student_id', label: 'বিদ্যমান শিক্ষার্থী আইডি (শুধুমাত্র আপডেটের জন্য)', group: 'Identification' },
  { key: 'academic_year', label: 'শিক্ষাবর্ষ (যেমন: 2026)', group: 'Enrollment' },
  { key: 'program_id', label: 'প্রোগ্রাম আইডি / কোড', group: 'Enrollment' },
  { key: 'class_id', label: 'শ্রেণি আইডি', group: 'Enrollment' },
  { key: 'section_id', label: 'শাখা আইডি', group: 'Enrollment' },
  { key: 'roll_number', label: 'শ্রেণি রোল নম্বর', group: 'Enrollment' },
];

export const ImportUploadMappingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeJobId = searchParams.get('resume');

  // Step 1: Upload state
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>('CREATE_ONLY');
  const [jobId, setJobId] = useState<number | null>(resumeJobId ? parseInt(resumeJobId, 10) : null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Mapping state
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headerRow, setHeaderRow] = useState<number>(1);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [extracting, setExtracting] = useState(false);
  const [savingMapping, setSavingMapping] = useState(false);

  // Fetch columns if resumeJobId is present
  useEffect(() => {
    if (jobId) {
      loadColumnsForJob(jobId);
    }
  }, [jobId]);

  const loadColumnsForJob = async (id: number, sheet?: string, hRow?: number) => {
    try {
      setExtracting(true);
      setError(null);
      const res = await dataExchangeApi.extractColumns(id, sheet, hRow);
      setSheets(res.sheets || []);
      const activeSheet = sheet || res.sheets?.[0] || 'Sheet1';
      setSelectedSheet(activeSheet);
      setDetectedColumns(res.detected_columns || []);
      setSampleRows(res.sample_rows || []);

      // Auto-map based on exact or lower-case matches
      const initialMap: Record<string, string> = {};
      const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
      res.detected_columns.forEach((colName, idx) => {
        const letter = colLetters[idx] || `COL_${idx + 1}`;
        const cleanCol = colName.toLowerCase().trim().replace(/[\s\-_]+/g, '_');
        const matchedField = SYSTEM_FIELDS.find(
          (f) =>
            f.key.toLowerCase() === cleanCol ||
            f.label.toLowerCase().includes(cleanCol) ||
            cleanCol.includes(f.key.replace('.', '_'))
        );
        if (matchedField) {
          initialMap[letter] = matchedField.key;
        }
      });
      setColumnMapping(initialMap);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'কলাম এক্সট্রাক্ট করতে সমস্যা হয়েছে।');
    } finally {
      setExtracting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('অনুগ্রহ করে একটি .xlsx ফাইল নির্বাচন করুন।');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const job = await dataExchangeApi.uploadWorkbook(file, mode, '1.0');
      setJobId(job.id);
      await loadColumnsForJob(job.id);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setUploading(false);
    }
  };

  const handleSheetOrHeaderChange = async (newSheet: string, newHeaderRow: number) => {
    if (!jobId) return;
    setSelectedSheet(newSheet);
    setHeaderRow(newHeaderRow);
    await loadColumnsForJob(jobId, newSheet, newHeaderRow);
  };

  const handleProceedToValidation = async () => {
    if (!jobId) return;
    try {
      setSavingMapping(true);
      setError(null);

      // Save mapping
      await dataExchangeApi.saveMapping(jobId, {
        sheet: selectedSheet,
        header_row: headerRow,
        mapping: columnMapping,
      });

      // Navigate to preview page
      navigate(`/app/data-exchange/imports/${jobId}/preview`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'ম্যাপিং সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setSavingMapping(false);
    }
  };

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/app/data-exchange" className="hover:text-teal-700">
          ডেটা এক্সচেঞ্জ
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">নতুন এক্সেল ইমপোর্ট ও ম্যাপিং</span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">এক্সেল ফাইল আপলোড ও ফিল্ড ম্যাপিং</h1>
          <p className="text-xs text-gray-500 mt-1">
            ধাপ ১: ওপেনএক্সএমএল ফাইল আপলোড করুন → ধাপ ২: এক্সেল কলামের সাথে সিস্টেম ফিল্ড মিলিয়ে নিন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/data-exchange/templates"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
          >
            টেমপ্লেট প্রয়োজন?
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box (Only if not uploaded yet) */}
      {!jobId && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">ইমপোর্ট মোড নির্বাচন করুন *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('CREATE_ONLY')}
                  className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                    mode === 'CREATE_ONLY'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold">CREATE_ONLY</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-normal">শুধুমাত্র নতুন শিক্ষার্থী যোগ হবে</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('UPDATE_ONLY')}
                  className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                    mode === 'UPDATE_ONLY'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold">UPDATE_ONLY</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-normal">বিদ্যমান শিক্ষার্থী আপডেট হবে</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('UPSERT')}
                  className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                    mode === 'UPSERT'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-bold">UPSERT</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-normal">নতুন তৈরি ও পুরাতন আপডেট</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">ফাইল নির্বাচন করুন (.xlsx) *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="excel-file-input"
                />
                <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                  <div className="text-xs font-semibold text-gray-800">
                    {file ? file.name : 'ব্রাউজ করুন অথবা ড্র্যাগ করে আনুন'}
                  </div>
                  <div className="text-[11px] text-gray-400">সর্বোচ্চ ১০ মেগাবাইট · শুধুমাত্র .xlsx সমর্থিত</div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2.5 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? 'আপলোড ও কোয়ারেন্টাইন প্রক্রিয়াকরণ হচ্ছে...' : 'আপলোড করুন ও ফিল্ড ম্যাপিংয়ে যান'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Mapping Section (If jobId exists) */}
      {jobId && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Table className="w-5 h-5 text-teal-600" />
                কলাম ম্যাপিং ও শিট কনফিগারেশন
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                কাজের আইডি: <span className="font-mono font-bold text-gray-800">JOB-{jobId}</span> · মোড: <span className="font-bold text-teal-800">{mode}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 mr-2">ওয়ার্কশিট:</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetOrHeaderChange(e.target.value, headerRow)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                >
                  {sheets.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 mr-2">হেডার সারি:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={headerRow}
                  onChange={(e) => handleSheetOrHeaderChange(selectedSheet, parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center"
                />
              </div>
            </div>
          </div>

          {extracting ? (
            <div className="p-12 text-center text-xs text-gray-500">কলাম বিশ্লেষণ করা হচ্ছে...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detectedColumns.map((colName, idx) => {
                  const letter = colLetters[idx] || `COL_${idx + 1}`;
                  const currentMappedField = columnMapping[letter] || '';

                  return (
                    <div
                      key={letter}
                      className="p-3.5 border border-gray-200 rounded-lg hover:border-teal-500 transition bg-gray-50/50 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          কলাম {letter}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]" title={colName}>
                          "{colName}"
                        </span>
                      </div>

                      <div>
                        <select
                          value={currentMappedField}
                          onChange={(e) => {
                            const val = e.target.value;
                            setColumnMapping((prev) => {
                              const updated = { ...prev };
                              if (!val) {
                                delete updated[letter];
                              } else {
                                updated[letter] = val;
                              }
                              return updated;
                            });
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                            currentMappedField
                              ? 'border-teal-500 bg-white font-semibold text-gray-900'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                          }`}
                        >
                          <option value="">— উপেক্ষা করুন (Ignore) —</option>
                          {SYSTEM_FIELDS.map((sf) => (
                            <option key={sf.key} value={sf.key}>
                              {sf.label} {sf.required ? '(*)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sample Data Table */}
              {sampleRows.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 text-xs font-bold text-gray-700 border-b border-gray-200">
                    নমুনা ডাটা প্রিভিউ (প্রথম ৩ সারি)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 text-gray-600">
                        <tr>
                          {detectedColumns.map((col, idx) => (
                            <th key={idx} className="p-2.5 border-r border-gray-200">
                              {colLetters[idx]}: {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sampleRows.slice(0, 3).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50">
                            {detectedColumns.map((col, cIdx) => (
                              <td key={cIdx} className="p-2.5 border-r border-gray-200 font-mono text-[11px] text-gray-700">
                                {String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Proceed Button */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setJobId(null)}
              className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
            >
              ← অন্য ফাইল আপলোড করুন
            </button>

            <button
              type="button"
              disabled={savingMapping || Object.keys(columnMapping).length === 0}
              onClick={handleProceedToValidation}
              className="px-6 py-2.5 bg-[#137C73] text-white rounded-lg text-xs font-bold hover:bg-[#0f645d] transition disabled:opacity-50 flex items-center gap-2"
            >
              {savingMapping ? 'যাচাই করা হচ্ছে...' : 'ম্যাপিং সংরক্ষণ ও প্রিভিউ দেখুন'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
