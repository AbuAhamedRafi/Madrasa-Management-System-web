import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { StudentDocument, StudentProfile, DocumentType } from '../../../types/students';
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const StudentDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('BIRTH_CERTIFICATE');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Verify Modal State
  const [verifyingDoc, setVerifyingDoc] = useState<StudentDocument | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [verificationNote, setVerificationNote] = useState('');
  const [verifying, setVerifying] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const studentData = await studentsApi.getStudent(Number(id));
      setStudent(studentData);
      const docsData = await studentsApi.getDocuments(Number(id));
      setDocuments(docsData);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !uploadFile) return;

    if (uploadFile.type !== 'application/pdf' && !uploadFile.name.toLowerCase().endsWith('.pdf')) {
      setError(isBn ? 'শুধুমাত্র PDF ফাইল (.pdf) আপলোড করা যাবে।' : 'Only PDF files (.pdf) are accepted.');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      setError(isBn ? 'ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' : 'File size cannot exceed 5MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await studentsApi.uploadDocument(Number(id), uploadFile, docType, description);
      setSuccessMsg(isBn ? 'ডকুমেন্ট সফলভাবে আপলোড হয়েছে।' : 'Document uploaded successfully.');
      setUploadFile(null);
      setDescription('');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: number, originalName: string) => {
    if (!id) return;
    try {
      const blob = await studentsApi.downloadDocument(Number(id), docId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || `document_${docId}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to stream document.');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !verifyingDoc) return;

    try {
      setVerifying(true);
      setError(null);
      await studentsApi.verifyDocument(Number(id), verifyingDoc.id, {
        status: verifyStatus,
        verification_note: verificationNote,
      });
      setSuccessMsg(isBn ? 'ডকুমেন্ট ভেরিফিকেশন হালনাগাদ হয়েছে।' : 'Document verification updated.');
      setVerifyingDoc(null);
      setVerificationNote('');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update verification.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!id) return;
    const confirmed = window.confirm(
      isBn ? 'আপনি কি নিশ্চিতভাবে এই ডকুমেন্টটি আর্কাইভ করতে চান?' : 'Are you sure you want to archive this document?'
    );
    if (!confirmed) return;

    try {
      setError(null);
      await studentsApi.deleteDocument(Number(id), docId);
      setSuccessMsg(isBn ? 'ডকুমেন্ট আর্কাইভ করা হয়েছে।' : 'Document archived successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to archive document.');
    }
  };

  const getDocTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'BIRTH_CERTIFICATE':
        return isBn ? 'জন্ম সনদ' : 'Birth Certificate';
      case 'NID':
        return isBn ? 'জাতীয় পরিচয়পত্র' : 'NID';
      case 'PREVIOUS_TRANSCRIPT':
        return isBn ? 'পূর্বের সনদ / মার্কশিট' : 'Previous Transcript';
      case 'GUARDIAN_NID':
        return isBn ? 'অভিভাবকের এনআইডি' : 'Guardian NID';
      case 'PHOTO':
        return isBn ? 'শিক্ষার্থীর ছবি' : 'Student Photo';
      case 'OTHER':
        return isBn ? 'অন্যান্য সনদ' : 'Other Document';
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            {isBn ? 'যাচাইকৃত' : 'Verified'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            {isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'অপেক্ষমাণ' : 'Pending'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        {isBn ? 'ডকুমেন্ট লোড হচ্ছে...' : 'Loading documents...'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/students/${id}`}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isBn ? 'সংযুক্ত নথিপত্র ও প্রমাণপত্র' : 'Student Documents & Verification'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {student?.student_id} · {isBn ? student?.name_bn : student?.name_en}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-600" />
              {isBn ? 'নতুন নথি আপলোড' : 'Upload Document'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'শুধুমাত্র PDF ফাইল (সর্বোচ্চ ৫ মেগাবাইট)। নিরাপদ প্রাইভেট স্টোরেজে সংরক্ষিত হবে।'
                : 'Only PDF documents are accepted (Max 5MB). Stored securely in private storage.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নথির ধরন *' : 'Document Type *'}
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="BIRTH_CERTIFICATE">{isBn ? 'জন্ম সনদ' : 'Birth Certificate'}</option>
                <option value="NID">{isBn ? 'জাতীয় পরিচয়পত্র' : 'NID'}</option>
                <option value="PREVIOUS_TRANSCRIPT">{isBn ? 'পূর্বের সনদ / মার্কশিট' : 'Previous Transcript'}</option>
                <option value="GUARDIAN_NID">{isBn ? 'অভিভাবকের এনআইডি' : 'Guardian NID'}</option>
                <option value="OTHER">{isBn ? 'অন্যান্য নথি' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'PDF ফাইল নির্বাচন করুন *' : 'Select PDF File *'}
              </label>
              <input
                type="file"
                required
                accept=".pdf,application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'বিবরণ / নোট (ঐচ্ছিক)' : 'Description (Optional)'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isBn ? 'উদা: মূল কপি যাচাইকৃত' : 'e.g. Original copy verified'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="w-full py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {uploading
                ? isBn
                  ? 'আপলোড হচ্ছে...'
                  : 'Uploading...'
                : isBn
                ? 'আপলোড করুন'
                : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Documents Table Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {isBn ? 'সংযুক্ত নথিসমূহ' : 'Attached Documents'} ({documents.length})
              </h2>
            </div>

            {documents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                {isBn ? 'কোনো নথি আপলোড করা হয়নি।' : 'No documents uploaded yet.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-xs">
                            {doc.original_filename || doc.file_name || 'document'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {getDocTypeLabel(doc.document_type || doc.type || 'OTHER')}
                          </span>
                          {getStatusChip(doc.verification_status)}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>{(((doc.file_size_bytes || doc.size_bytes || 0)) / 1024).toFixed(1)} KB</span>
                          <span>{doc.mime_type}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            SHA: {(doc.sha256_hash || doc.sha256 || '').substring(0, 10)}...
                          </span>
                        </div>

                        {(doc.verification_note || doc.verification_reason) && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1">
                            {isBn ? 'ভেরিফিকেশন নোট:' : 'Note:'} {doc.verification_note || doc.verification_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        title={isBn ? 'ডাউনলোড' : 'Download'}
                        onClick={() => handleDownload(doc.id, doc.original_filename || doc.file_name || 'document')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        title={isBn ? 'যাচাই / সিদ্ধান্ত' : 'Verify'}
                        onClick={() => {
                          setVerifyingDoc(doc);
                          setVerifyStatus(doc.verification_status === 'REJECTED' ? 'REJECTED' : 'VERIFIED');
                          setVerificationNote(doc.verification_note || doc.verification_reason || '');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-teal-200 bg-white text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        {isBn ? 'যাচাই' : 'Verify'}
                      </button>

                      <button
                        title={isBn ? 'আর্কাইভ করুন' : 'Archive'}
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'ডকুমেন্ট যাচাইকরণ' : 'Document Verification'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {verifyingDoc.original_filename || verifyingDoc.file_name}
            </p>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'যাচাই অবস্থা *' : 'Verification Status *'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyStatus('VERIFIED')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      verifyStatus === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isBn ? 'অনুমোদন (সঠিক)' : 'Verified'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyStatus('REJECTED')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      verifyStatus === 'REJECTED'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    {isBn ? 'বাতিল' : 'Rejected'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'যাচাই মন্তব্য / নোট' : 'Verification Notes'}
                </label>
                <textarea
                  rows={3}
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder={
                    isBn
                      ? 'অডিট সংক্রান্ত মন্তব্য লিখুন...'
                      : 'Audit feedback or reason for status...'
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingDoc(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {verifying
                    ? isBn
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBn
                    ? 'সংরক্ষণ করুন'
                    : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
