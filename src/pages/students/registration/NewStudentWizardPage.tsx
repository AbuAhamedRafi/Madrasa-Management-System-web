import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { DuplicateCheckResult } from '../../../types/students';
import {
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Check,
} from 'lucide-react';

export const NewStudentWizardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    date_of_birth: '',
    gender: 'MALE',
    admission_date: new Date().toISOString().split('T')[0],
    birth_registration_number: '',
    present_address_bn: '',
    present_address_en: '',
    permanent_address_bn: '',
    permanent_address_en: '',
    primary_guardian: {
      name_bn: '',
      name_en: '',
      phone: '',
      alternative_phone: '',
      relation: 'FATHER',
      sms_consent: true,
      consent_source: 'ADMISSION_FORM',
      occupation: '',
      address_bn: '',
    },
    override_review_id: null as number | null,
  });

  const handlePersonalNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name_bn || !formData.name_en || !formData.date_of_birth) {
      setError(isBn ? 'আবশ্যক তথ্যগুলো পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }
    setStep(2);
  };

  const handleGuardianNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pg = formData.primary_guardian;
    if (!pg.name_bn || !pg.name_en || !pg.phone) {
      setError(
        isBn
          ? 'প্রাইমারি অভিভাবকের নাম ও মোবাইল নম্বর আবশ্যক।'
          : 'Primary guardian name and phone are required.'
      );
      return;
    }

    // Trigger Duplicate Check
    setCheckingDuplicate(true);
    try {
      const checkRes = await studentsApi.checkDuplicate({
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        date_of_birth: formData.date_of_birth,
        birth_registration_number: formData.birth_registration_number || undefined,
        guardian_phone: pg.phone,
      });
      setDuplicateResult(checkRes);
      setStep(3);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          (isBn ? 'ডুপ্লিকেট যাচাই করা যায়নি।' : 'Failed to verify duplicates.')
      );
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (duplicateResult?.is_blocked) {
      setError(
        isBn
          ? 'জন্ম নিবন্ধন নম্বর ইতিমধ্যে বিদ্যমান। এই শিক্ষার্থীকে ভর্তি করা যাবে না।'
          : 'Exact birth registration already exists. Registration blocked.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const idempotencyKey = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const student = await studentsApi.registerStudent(formData, idempotencyKey);
      navigate(`/app/students/${student.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          (isBn ? 'শিক্ষার্থী তৈরি ব্যর্থ হয়েছে।' : 'Failed to register student.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!duplicateResult) return;
    setSubmitting(true);
    try {
      const review = await studentsApi.submitDuplicateReview({
        proposed_payload: formData,
        candidate_matches: duplicateResult.matches,
      });
      alert(
        isBn
          ? `ডুপ্লিকেট রিভিউ কিউতে সফলভাবে জমা হয়েছে (রিভিউ #${review.id})। অ্যাডমিন অনুমোদনের পর ভর্তি করা যাবে।`
          : `Submitted to duplicate review queue (Review #${review.id}). Registration can proceed once approved by Admin.`
      );
      navigate('/app/students');
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          (isBn ? 'রিভিউ জমা ব্যর্থ হয়েছে।' : 'Failed to submit review.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="text-xs text-slate-500 mb-1">
          <Link to="/app/students" className="hover:underline">
            {isBn ? 'শিক্ষার্থী তালিকা' : 'Student Directory'}
          </Link>{' '}
          / {isBn ? 'নতুন শিক্ষার্থী ভর্তি' : 'New Admission'}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isBn ? 'নতুন শিক্ষার্থী ভর্তি ফরম' : 'Student Admission Intake'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'শিক্ষার্থীর পরিচিতি ও অভিভাবকের তথ্য প্রদান করে স্থায়ী শিক্ষার্থী আইডি তৈরি করুন'
            : 'Fill student personal & guardian details to generate permanent student ID'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            step === 1
              ? 'bg-[#137C73] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isBn ? '১. ব্যক্তিগত তথ্য' : '1. Personal Details'}</span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            step === 2
              ? 'bg-[#137C73] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isBn ? '২. অভিভাবক ও যোগাযোগ' : '2. Guardian & Contact'}</span>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            step === 3
              ? 'bg-[#137C73] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isBn ? '৩. যাচাই ও নিশ্চিতকরণ' : '3. Verification & Submit'}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <form onSubmit={handlePersonalNext} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'শিক্ষার্থীর ব্যক্তিগত পরিচিতি' : 'Student Personal Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? 'নাম ও জন্মতারিখ নির্ভুলভাবে প্রবেশ করুন' : 'Enter official name and birth details accurately'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}
              </label>
              <input
                required
                type="text"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                placeholder={isBn ? 'যেমন: মুহাম্মদ আব্দুর রহমান' : 'e.g. মুহাম্মদ আব্দুর রহমান'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (ইংরেজি) *' : 'Name (English) *'}
              </label>
              <input
                required
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Muhammad Abdur Rahman"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'জন্মতারিখ *' : 'Date of Birth *'}
              </label>
              <input
                required
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'লিঙ্গ *' : 'Gender *'}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              >
                <option value="MALE">{isBn ? 'ছাত্র (MALE)' : 'Male'}</option>
                <option value="FEMALE">{isBn ? 'ছাত্রী (FEMALE)' : 'Female'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'ভর্তির তারিখ *' : 'Admission Date *'}
              </label>
              <input
                required
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                {isBn
                  ? 'এই তারিখ অনুযায়ী স্বয়ংক্রিয়ভাবে YY01/YY02 ফরম্যাটে আইডি তৈরি হবে।'
                  : 'Student ID prefix is computed from this date.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'জন্ম নিবন্ধন নম্বর (BRC)' : 'Birth Registration Number (17 digits)'}
              </label>
              <input
                type="text"
                maxLength={17}
                value={formData.birth_registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, birth_registration_number: e.target.value })
                }
                placeholder="20150000000000000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'বর্তমান ঠিকানা (বাংলা)' : 'Present Address (Bangla)'}
              </label>
              <textarea
                rows={2}
                value={formData.present_address_bn}
                onChange={(e) => setFormData({ ...formData, present_address_bn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'স্থায়ী ঠিকানা (বাংলা)' : 'Permanent Address (Bangla)'}
              </label>
              <textarea
                rows={2}
                value={formData.permanent_address_bn}
                onChange={(e) => setFormData({ ...formData, permanent_address_bn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#137C73] text-white text-xs font-bold hover:bg-[#0f635c] transition-colors"
            >
              <span>{isBn ? 'পরবর্তী: অভিভাবকের তথ্য' : 'Next: Guardian Details'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Guardian Details */}
      {step === 2 && (
        <form onSubmit={handleGuardianNext} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'প্রাইমারি অভিভাবকের তথ্য' : 'Primary Guardian Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'শিক্ষার্থীর জন্য অন্তত একজন অভিভাবক আবশ্যক। ভাইবোন থাকলে একই মোবাইল নম্বর ব্যবহার করা যাবে।'
                : 'At least one primary guardian is required. Siblings may share the same contact number.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'অভিভাবকের নাম (বাংলা) *' : 'Guardian Name (Bangla) *'}
              </label>
              <input
                required
                type="text"
                value={formData.primary_guardian.name_bn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_guardian: { ...formData.primary_guardian, name_bn: e.target.value },
                  })
                }
                placeholder={isBn ? 'যেমন: মো. কামাল হোসেন' : 'e.g. Md. Kamal Hossain'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'অভিভাবকের নাম (ইংরেজি) *' : 'Guardian Name (English) *'}
              </label>
              <input
                required
                type="text"
                value={formData.primary_guardian.name_en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_guardian: { ...formData.primary_guardian, name_en: e.target.value },
                  })
                }
                placeholder="e.g. Md. Kamal Hossain"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
              </label>
              <input
                required
                type="text"
                value={formData.primary_guardian.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_guardian: { ...formData.primary_guardian, phone: e.target.value },
                  })
                }
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'সম্পর্ক *' : 'Relationship *'}
              </label>
              <select
                value={formData.primary_guardian.relation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_guardian: {
                      ...formData.primary_guardian,
                      relation: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#137C73] focus:outline-none"
              >
                <option value="FATHER">{isBn ? 'পিতা (Father)' : 'Father'}</option>
                <option value="MOTHER">{isBn ? 'মাতা (Mother)' : 'Mother'}</option>
                <option value="LEGAL_GUARDIAN">{isBn ? 'আইনগত অভিভাবক' : 'Legal Guardian'}</option>
                <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.primary_guardian.sms_consent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_guardian: {
                      ...formData.primary_guardian,
                      sms_consent: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded text-[#137C73] focus:ring-[#137C73]"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">
                  {isBn ? 'এসএমএস বিজ্ঞপ্তির সম্মতি (SMS Consent)' : 'SMS Notification Consent'}
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {isBn
                    ? 'মাদ্রাসার নোটিশ, ফি রসিদ ও জরুরি তথ্য এই নম্বরে পাঠানোর সম্মতি নেওয়া হয়েছে।'
                    : 'Authorized to dispatch official institutional notices & receipts to this phone.'}
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>

            <button
              type="submit"
              disabled={checkingDuplicate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#137C73] text-white text-xs font-bold hover:bg-[#0f635c] transition-colors disabled:opacity-50"
            >
              <span>
                {checkingDuplicate
                  ? isBn
                    ? 'ডুপ্লিকেট যাচাই হচ্ছে...'
                    : 'Checking duplicates...'
                  : isBn
                  ? 'পরবর্তী: ডুপ্লিকেট যাচাই ও সারসংক্ষেপ'
                  : 'Next: Verify & Preview'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Duplicate Check & Final Submit */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'ডুপ্লিকেট যাচাই ফলাফল ও ভর্তি নিশ্চিতকরণ' : 'Duplicate Verification & Confirmation'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'তথ্য যাচাই করে ভর্তি নিশ্চিত করুন। সিস্টেম স্বয়ংক্রিয়ভাবে একটি স্থায়ী শিক্ষার্থী আইডি বরাদ্দ করবে।'
                : 'Review details and confirm admission. System will allocate permanent Student ID.'}
            </p>
          </div>

          {/* Exact Match Warning */}
          {duplicateResult?.is_blocked && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4" />
                <span>{isBn ? 'সরাসরি ডুপ্লিকেট শনাক্ত হয়েছে (ভর্তি নিষিদ্ধ)' : 'Exact Duplicate Detected (Blocked)'}</span>
              </div>
              <p>
                {isBn
                  ? 'এই জন্ম নিবন্ধন নম্বরের (BRC) অধীনে ইতিমধ্যে শিক্ষার্থী নিবন্ধিত আছে। একই শিক্ষার্থীকে পুনরায় ভর্তি করা যাবে না।'
                  : 'A student with this exact birth registration number is already registered.'}
              </p>
            </div>
          )}

          {/* Potential Duplicate Matches */}
          {duplicateResult?.has_potential_duplicate && !duplicateResult.is_blocked && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4" />
                <span>{isBn ? 'সম্ভাব্য ডুপ্লিকেট শিক্ষার্থী পাওয়া গেছে' : 'Potential Duplicate Candidates Found'}</span>
              </div>
              <p>
                {isBn
                  ? 'একই জন্মতারিখ ও মিল থাকা নাম অথবা অভিভাবকের ফোন নম্বরের অধীনে নিম্নের রেকর্ডগুলো বিদ্যমান:'
                  : 'Similar birth date, name, or guardian contact match existing records:'}
              </p>

              <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100/60 text-amber-900">
                    <tr>
                      <th className="p-2">আইডি / নাম</th>
                      <th className="p-2">জন্মতারিখ</th>
                      <th className="p-2">মিল পাওয়ার কারণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {duplicateResult.matches.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold">
                          {m.student_id} - {m.name_bn} ({m.name_en})
                        </td>
                        <td className="p-2 font-mono">{m.date_of_birth}</td>
                        <td className="p-2">
                          {m.match_reasons.map((r, ri) => (
                            <span
                              key={ri}
                              className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] mr-1"
                            >
                              {r}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-amber-800">
                  {isBn
                    ? 'এটি যদি সত্যিই ভিন্ন শিক্ষার্থী হয়ে থাকে, তবে অ্যাডমিন পর্যালোচনার জন্য জমা দিন।'
                    : 'If this is a distinct student, submit for administrative review.'}
                </span>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-50"
                >
                  {isBn ? 'অ্যাডমিন কিউতে জমা দিন' : 'Submit for Admin Review'}
                </button>
              </div>
            </div>
          )}

          {/* Clean / No Duplicate State */}
          {!duplicateResult?.is_blocked && !duplicateResult?.has_potential_duplicate && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'কোনো ডুপ্লিকেট পাওয়া যায়নি। নতুন শিক্ষার্থী সফলভাবে নিবন্ধন করা যাবে।' : 'No duplicate matches found. Ready for confirmed registration.'}</span>
            </div>
          )}

          {/* Preview Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">{isBn ? 'শিক্ষার্থীর নাম:' : 'Student Name:'}</span>
              <strong className="text-slate-900">{formData.name_bn}</strong>
              <div className="text-slate-500 text-[11px]">{formData.name_en}</div>
            </div>
            <div>
              <span className="text-slate-400 block">{isBn ? 'জন্মতারিখ / লিঙ্গ:' : 'DOB / Gender:'}</span>
              <strong className="text-slate-900">{formData.date_of_birth}</strong>
              <div className="text-slate-500 text-[11px]">{formData.gender}</div>
            </div>
            <div>
              <span className="text-slate-400 block">{isBn ? 'ভর্তির তারিখ:' : 'Admission Date:'}</span>
              <strong className="text-slate-900">{formData.admission_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isBn ? 'অভিভাবকের নাম:' : 'Guardian Name:'}</span>
              <strong className="text-slate-900">{formData.primary_guardian.name_bn}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isBn ? 'অভিভাবকের মোবাইল:' : 'Guardian Phone:'}</span>
              <strong className="text-slate-900 font-mono">{formData.primary_guardian.phone}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isBn ? 'সম্পর্ক / এসএমএস:' : 'Relation / SMS:'}</span>
              <strong className="text-slate-900">
                {formData.primary_guardian.relation} (
                {formData.primary_guardian.sms_consent ? 'Consent Yes' : 'No'})
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>

            {!duplicateResult?.is_blocked && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#137C73] text-white text-xs font-bold hover:bg-[#0f635c] transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {submitting
                    ? isBn
                      ? 'ভর্তি সম্পন্ন হচ্ছে...'
                      : 'Registering...'
                    : isBn
                    ? 'ভর্তি নিশ্চিত ও স্থায়ী আইডি তৈরি করুন'
                    : 'Confirm Admission & Generate ID'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
