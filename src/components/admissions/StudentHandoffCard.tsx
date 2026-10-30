import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, ShieldCheck, FileSpreadsheet, Receipt } from 'lucide-react';
import type { Enrollment } from '../../types/admissions';

interface Props {
  enrollment: Enrollment;
}

export const StudentHandoffCard: React.FC<Props> = ({ enrollment }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const isBilled = enrollment.billing_cleared || enrollment.status === 'PENDING_PAYMENT' || enrollment.status === 'APPROVED';
  const isApproved = enrollment.status === 'APPROVED';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            {isBn ? 'আন্তঃমডিউল আর্থিক ও ভর্তি অনুমোদন প্রক্রিয়া' : 'Inter-Module Financial & Admission Clearance Flow'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {isBn
            ? 'ভর্তি আবেদন সরাসরি অনুমোদিত হয় না; আসন বরাদ্দের পর হিসাব বিভাগের ফি নির্ধারণ ও রসিদ পরিশোধের মাধ্যমে চূড়ান্ত অনুমোদন সম্পন্ন হয়।'
            : 'Enrollments do not immediately become active; seats are reserved in PENDING_BILLING until fee liabilities are established and settled.'}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: Admission & Placement */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                {isBn ? 'ধাপ ১: আসন বরাদ্দ (D04)' : 'Step 1: Placement (D04)'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-slate-900 text-sm">
              {isBn ? 'শাখা ও আসন নিশ্চিত' : 'Seat Reserved in Section'}
            </div>
            <p className="text-xs text-slate-600">
              {isBn ? 'শিক্ষার্থীর আসন সফলভাবে বরাদ্দকৃত হয়েছে।' : 'Seat allocated and locked under row-level concurrency.'}
            </p>
          </div>

          {/* Step 2: Billing Liability */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isBilled
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-amber-200 bg-amber-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isBilled ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {isBn ? 'ধাপ ২: ফি নির্ধারণ (D06)' : 'Step 2: Billing (D06)'}
              </span>
              {isBilled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              )}
            </div>
            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              {isBilled
                ? isBn ? 'ফি প্রস্তুতকৃত' : 'Billed / Invoice Ready'
                : isBn ? 'হিসাব বিভাগের অপেক্ষায়' : 'Awaiting Accounts Review'}
            </div>
            <p className="text-xs text-slate-600">
              {isBilled
                ? isBn ? 'প্রোগ্রামের ফি তালিকা সংযুক্ত হয়েছে।' : 'Fee structure assessed by Accounts module.'
                : isBn ? 'হিসাব বিভাগ থেকে শিক্ষার্থী ফি নির্ধারণ করবেন।' : 'Pending fee schedule generation by Accounts office.'}
            </p>
          </div>

          {/* Step 3: Cash Clearance */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              isApproved
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isApproved ? 'text-emerald-800' : 'text-slate-500'
                }`}
              >
                {isBn ? 'ধাপ ৩: পেমেন্ট ও অনুমোদন (D07)' : 'Step 3: Approval (D07)'}
              </span>
              {isApproved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Receipt className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="font-semibold text-slate-900 text-sm">
              {isApproved
                ? isBn ? 'ভর্তি অনুমোদিত ও সক্রিয়' : 'Admission Fully Approved'
                : isBn ? 'ক্যাশ জমা অপেক্ষমাণ' : 'Pending Payment Slip'}
            </div>
            <p className="text-xs text-slate-600">
              {isApproved
                ? isBn ? 'পেমেন্ট সম্পন্ন হওয়ায় ভর্তি সক্রিয় করা হয়েছে।' : 'Charges cleared and program admission activated.'
                : isBn ? 'ক্যাশ কাউন্টারে ফি জমার পর স্বয়ংক্রিয় অনুমোদন হবে।' : 'Awaiting cash counter slip settlement.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
