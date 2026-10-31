import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { FeeAdjustmentRequest } from '../../types/billing';

export const WaiverApprovalQueuePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [requests, setRequests] = useState<FeeAdjustmentRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<FeeAdjustmentRequest | null>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await billingApi.listAdjustmentRequests({
        state: stateFilter || undefined,
        per_page: 50,
      });
      const list = res.data || [];
      setRequests(list);
      if (list.length > 0 && !selectedReq) {
        setSelectedReq(list[0]);
      } else if (selectedReq) {
        const refreshed = list.find((r) => r.id === selectedReq.id);
        if (refreshed) setSelectedReq(refreshed);
      }
    } catch (err) {
      console.error('Failed to load adjustment queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [stateFilter]);

  const handleApprove = async () => {
    if (!selectedReq) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const updated = await billingApi.approveAdjustmentRequest(selectedReq.id, {
        review_notes: reviewNotes || 'Approved after administrative verification',
        lock_version: selectedReq.lock_version,
      });
      setSelectedReq(updated);
      setSuccessMsg(
        isBn
          ? 'ছাড় / মওকুফ সফলভাবে অনুমোদিত ও ইনভয়েসে প্রয়োগ হয়েছে!'
          : 'Waiver approved and applied to invoice!'
      );
      await loadQueue();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          (isBn ? 'অনুমোদন ব্যর্থ হয়েছে' : 'Approval failed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!reviewNotes.trim()) {
      setErrorMsg(
        isBn
          ? 'প্রত্যাখ্যানের জন্য সুনির্দিষ্ট কারণ (Review Notes) লিখুন'
          : 'Please enter review notes before rejecting'
      );
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const updated = await billingApi.rejectAdjustmentRequest(
        selectedReq.id,
        reviewNotes,
        selectedReq.lock_version
      );
      setSelectedReq(updated);
      setSuccessMsg(isBn ? 'আবেদনটি প্রত্যাখ্যান করা হয়েছে' : 'Adjustment request rejected');
      await loadQueue();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.state === 'PENDING_APPROVAL').length;
  const approvedCount = requests.filter((r) => r.state === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.state === 'REJECTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Link to="/app/billing" className="hover:underline flex items-center gap-1 text-teal-700">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? 'বিলিং ড্যাশবোর্ড' : 'Billing'}
            </Link>
            <span>/</span>
            <span>{isBn ? 'ছাড় ও মওকুফ' : 'Adjustments'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'ছাড়, স্কলারশিপ ও মওকুফ অনুমোদন' : 'Discounts, Scholarships & Waivers'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'দায়িত্ব পৃথকীকরণ (Separation of Duties) ও নিরীক্ষাযোগ্য অনুমোদনের মাধ্যমে ইনভয়েস ছাড় পর্যালোচনা করুন'
              : 'Review controlled invoice adjustments with traceable approvals and separation of duties.'}
          </p>
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700"
        >
          <option value="">{isBn ? 'সকল অবস্থা' : 'All States'}</option>
          <option value="PENDING_APPROVAL">{isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Review'}</option>
          <option value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</option>
          <option value="REJECTED">{isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}</option>
          <option value="CANCELLED">{isBn ? 'বাতিলকৃত' : 'Cancelled'}</option>
        </select>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'পর্যালোচনা অপেক্ষমান' : 'Pending Review'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'প্রশাসনিক অনুমোদন আবশ্যক' : 'Administrative approval required'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'অনুমোদিত ছাড়' : 'Approved Adjustments'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{approvedCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'অপরিবর্তনীয় অনুমোদন রেকর্ড' : 'Immutable approval events'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{rejectedCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'কারণ সংরক্ষিত' : 'Reason preserved'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'মোট আবেদন' : 'Total Requests'}</span>
            <AlertTriangle className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{requests.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'দায়িত্ব পৃথকীকরণ সক্রিয়' : 'Separation of duties enforced'}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 3 Columns: Requests Table */}
        <section className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#182C4B] mb-4">
            {isBn ? 'ছাড় ও মওকুফ আবেদন তালিকা' : 'Waiver & Discount Requests'}
          </h2>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'আবেদন #' : 'Request'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'শিক্ষার্থী / ইনভয়েস' : 'Student / Invoice'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'ফি খাত' : 'Scope'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="py-2.5 px-3 font-semibold">{isBn ? 'অবস্থা' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {isBn ? 'লোড হচ্ছে...' : 'Loading requests...'}
                    </td>
                  </tr>
                ) : !requests.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {isBn ? 'কোনো ছাড়ের আবেদন নেই' : 'No adjustment requests found'}
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => {
                        setSelectedReq(req);
                        setReviewNotes(req.review_notes || '');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className={`cursor-pointer transition-colors ${
                        selectedReq?.id === req.id ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        WVR-{req.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">
                          {req.invoice?.student
                            ? isBn
                              ? req.invoice.student.full_name_bn
                              : req.invoice.student.full_name_en
                            : `#${req.invoice_id}`}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {req.invoice?.invoice_number}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div>
                          {isBn
                            ? req.invoice_item?.description_bn
                            : req.invoice_item?.description_en}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {req.adjustment_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        ৳ {req.requested_amount}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.state === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.state === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.state === 'PENDING_APPROVAL'
                            ? isBn
                              ? 'পর্যালোচনা'
                              : 'Review'
                            : req.state}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right 2 Columns: Review Detail Panel */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#182C4B]">
            {selectedReq
              ? `${isBn ? 'আবেদন পর্যালোচনা:' : 'Review Request:'} WVR-${selectedReq.id}`
              : isBn
              ? 'আবেদন নির্বাচন করুন'
              : 'Select a Request'}
          </h2>

          {!selectedReq ? (
            <div className="text-xs text-slate-500 py-8 text-center">
              {isBn
                ? 'বাম পাশের তালিকা থেকে একটি আবেদন নির্বাচন করুন'
                : 'Select a waiver request from the table to review'}
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="divide-y divide-dashed divide-slate-200">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isBn ? 'আবেদনকারী কর্মী' : 'Requesting Staff'}</span>
                  <strong className="text-slate-800">
                    {selectedReq.requester?.full_name_en ||
                      selectedReq.requester?.username ||
                      `User #${selectedReq.requested_by}`}
                  </strong>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isBn ? 'ইনভয়েস নম্বর' : 'Invoice'}</span>
                  <Link
                    to={`/app/billing/invoices/${selectedReq.invoice_id}`}
                    className="font-mono font-bold text-teal-700 hover:underline"
                  >
                    {selectedReq.invoice?.invoice_number || `#${selectedReq.invoice_id}`}
                  </Link>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isBn ? 'ফি খাত' : 'Fee Item'}</span>
                  <strong className="text-slate-800">
                    {isBn
                      ? selectedReq.invoice_item?.description_bn
                      : selectedReq.invoice_item?.description_en}
                  </strong>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isBn ? 'প্রস্তাবিত ছাড়' : 'Requested Waiver'}</span>
                  <strong className="font-mono text-sm text-amber-800">
                    ৳ {selectedReq.requested_amount} ({selectedReq.adjustment_type})
                  </strong>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{isBn ? 'কারণ' : 'Reason'}</span>
                  <strong className="text-slate-800 text-right max-w-[200px]">
                    {selectedReq.reason}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border-l-4 border-amber-500 text-amber-900 leading-relaxed">
                {isBn
                  ? 'ভর্তি চার্জ সম্পূর্ণ মওকুফ করা মানে সরাসরি এনরোলমেন্ট অনুমোদন নয়। অনুমোদিত ছাড়পত্র ওয়ার্কফ্লো বিলিং লেজার যাচাই করে।'
                  : 'A full admission-charge waiver is not a manual approval of an enrollment. The trusted clearance workflow must verify the authoritative billing ledger.'}
              </div>

              {selectedReq.state === 'PENDING_APPROVAL' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      {isBn ? 'পর্যালোচনা নোট (Review Notes)' : 'Review Decision Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder={
                        isBn
                          ? 'অনুমোদন বা প্রত্যাখ্যানের মন্তব্য লিখুন...'
                          : 'Enter approval or rejection notes...'
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    >
                      <X className="w-3.5 h-3.5" />
                      {isBn ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                    </button>

                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg font-bold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isBn ? 'ছাড় অনুমোদন করুন' : 'Approve Waiver'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
