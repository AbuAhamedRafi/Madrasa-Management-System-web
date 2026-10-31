import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { DuplicateReviewTicket, DuplicateReviewStatus } from '../../../types/students';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export const AdminDuplicateReviewQueuePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [tickets, setTickets] = useState<DuplicateReviewTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<DuplicateReviewStatus | 'ALL'>('PENDING');
  const [error, setError] = useState<string | null>(null);

  // Decision Modal State
  const [selectedTicket, setSelectedTicket] = useState<DuplicateReviewTicket | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus !== 'ALL' ? { status: filterStatus } : undefined;
      const res = await studentsApi.getDuplicateReviews(params);
      setTickets(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load duplicate review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedTicket) return;
    if (!decisionReason.trim()) {
      setModalError(isBn ? 'সিদ্ধান্তের কারণ উল্লেখ করা বাধ্যতামূলক।' : 'Decision reason is mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await studentsApi.decideDuplicateReview(selectedTicket.id, {
        decision,
        reason: decisionReason.trim(),
      });
      setSelectedTicket(null);
      setDecisionReason('');
      await loadTickets();
    } catch (err: any) {
      setModalError(err?.response?.data?.error?.message || 'Failed to record decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: DuplicateReviewStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'পর্যালোচনা অপেক্ষমাণ' : 'Pending Review'}
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            {isBn ? 'অনুমোদিত (ভর্তি অনুমতি)' : 'Approved'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            {isBn ? 'বাতিলকৃত' : 'Rejected'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            {isBn ? 'ডুপ্লিকেট পর্যালোচনা ও অনুমোদন কিউ' : 'Duplicate Review & Override Queue'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isBn
              ? 'ভর্তির সময় শনাক্ত হওয়া সম্ভাব্য পুনরাবৃত্তি প্রোফাইল পর্যালোচনা এবং ওভাররাইড সিদ্ধান্ত দিন'
              : 'Review suspected duplicate student registrations and issue authorized override decisions'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'PENDING'
                ? isBn
                  ? 'অপেক্ষমাণ'
                  : 'Pending'
                : st === 'APPROVED'
                ? isBn
                  ? 'অনুমোদিত'
                  : 'Approved'
                : st === 'REJECTED'
                ? isBn
                  ? 'বাতিল'
                  : 'Rejected'
                : isBn
                ? 'সকল'
                : 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {isBn ? 'পর্যালোচনা তালিকা লোড হচ্ছে...' : 'Loading review tickets...'}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {isBn ? 'এই ফিল্টারে কোনো পর্যালোচনা পাওয়া যায়নি।' : 'No review tickets found in this queue.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{isBn ? 'আবেদনকারী শিক্ষার্থী' : 'Candidate Student'}</th>
                  <th className="px-4 py-3">{isBn ? 'ম্যাচ স্কোর ও কারণ' : 'Match Reasons'}</th>
                  <th className="px-4 py-3">{isBn ? 'আবেদনের সময়' : 'Requested At'}</th>
                  <th className="px-4 py-3">{isBn ? 'অবস্থা' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {isBn ? ticket.payload?.name_bn : ticket.payload?.name_en}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        DOB: {ticket.payload?.date_of_birth} · Phone:{' '}
                        {ticket.payload?.primary_guardian?.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {ticket.matched_reasons?.map((r: string, i: number) => (
                          <span
                            key={i}
                            className="inline-block mr-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setDecisionReason(ticket.review_reason || '');
                          setModalError(null);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {ticket.status === 'PENDING'
                          ? isBn
                            ? 'সিদ্ধান্ত দিন'
                            : 'Review'
                          : isBn
                          ? 'বিস্তারিত'
                          : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? 'ডুপ্লিকেট পর্যালোচনা টিকেট' : 'Duplicate Review Ticket'} #{selectedTicket.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn ? 'বিদ্যমান শিক্ষার্থীর সাথে তুলনা করে সিদ্ধান্ত গ্রহণ করুন' : 'Compare candidate with existing student'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {modalError}
              </div>
            )}

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Candidate Info */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                  {isBn ? 'নতুন আবেদনকারী ডেটা' : 'Candidate Registration Data'}
                </div>
                <div>
                  <span className="text-slate-500">{isBn ? 'নাম:' : 'Name:'}</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {selectedTicket.payload?.name_bn} / {selectedTicket.payload?.name_en}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">{isBn ? 'জন্ম তারিখ:' : 'DOB:'}</span>{' '}
                  <span className="font-mono text-slate-800">
                    {selectedTicket.payload?.date_of_birth}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">{isBn ? 'অভিভাবকের ফোন:' : 'Guardian Phone:'}</span>{' '}
                  <span className="font-mono text-slate-800">
                    {selectedTicket.payload?.primary_guardian?.phone}
                  </span>
                </div>
                {selectedTicket.payload?.birth_registration_number && (
                  <div>
                    <span className="text-slate-500">BRC:</span>{' '}
                    <span className="font-mono text-slate-800">
                      {selectedTicket.payload.birth_registration_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Matched Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {isBn ? 'চিহ্নিত মিল ও কারণসমূহ' : 'Detected Match Diagnostics'}
                </div>
                <div className="space-y-1">
                  {selectedTicket.matched_reasons?.map((m: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-rose-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Reason Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {isBn ? 'অডিট ও সিদ্ধান্তের কারণ *' : 'Mandatory Decision Reason / Audit Notes *'}
              </label>
              <textarea
                rows={3}
                disabled={selectedTicket.status !== 'PENDING'}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={
                  isBn
                    ? 'সিদ্ধান্তের বিস্তারিত কারণ লিখুন (যথা: যমজ ভাইবোন নিশ্চিত হয়েছে / সঠিক নতুন শিক্ষার্থী)...'
                    : 'Explain reasons for approving override or rejecting candidate...'
                }
                className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>

              {selectedTicket.status === 'PENDING' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('REJECT')}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {isBn ? 'প্রত্যাখ্যান করুন' : 'Reject (Block)'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('APPROVE')}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isBn ? 'অনুমোদন করুন (ভর্তি অনুমতি)' : 'Approve Override'}
                  </button>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-500">
                  {isBn ? 'এই টিকেটের পর্যালোচনা সম্পন্ন হয়েছে।' : 'Review finalized.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
