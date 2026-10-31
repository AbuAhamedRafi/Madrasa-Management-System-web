import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { promotionsApi } from '../../services/promotionsApi';
import { admissionsApi } from '../../services/admissionsApi';
import { academicsApi } from '../../services/academicsApi';
import type { PromotionEligibilityResult } from '../../types/promotions';

export const IndividualPromotionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('bn') ? 'bn' : 'en';

  // Search & Student Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Source & Target Config
  const [sourceEnrollment, setSourceEnrollment] = useState<any | null>(null);
  const [action, setAction] = useState<'PROMOTE' | 'REPEAT'>('PROMOTE');
  const [targetPeriods, setTargetPeriods] = useState<any[]>([]);
  const [targetPeriodId, setTargetPeriodId] = useState<number | ''>('');
  const [offerings, setOfferings] = useState<any[]>([]);
  const [targetSectionId, setTargetSectionId] = useState<number | ''>('');

  // Preview & Execution State
  const [previewResult, setPreviewResult] = useState<PromotionEligibilityResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search students
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      setErrorMsg(null);
      const results = await admissionsApi.searchStudents(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to search students');
    } finally {
      setSearching(false);
    }
  };

  // Select student and resolve active enrollment
  const handleSelectStudent = async (studentItem: any) => {
    setSelectedStudent(studentItem);
    setSearchResults([]);
    setPreviewResult(null);
    setExecutionSuccess(null);
    setErrorMsg(null);

    try {
      // Find latest approved enrollment for this student
      const enrRes = await admissionsApi.getWorkbench({
        search: studentItem.student_id,
        status: 'APPROVED',
      });

      if (enrRes.data && enrRes.data.length > 0) {
        const enr = enrRes.data[0];
        setSourceEnrollment(enr);

        // Fetch periods and offerings for this program
        const programId = (enr as any).academic_offering?.program_class?.program_id || (enr as any).offering?.program_class?.program_id;
        if (programId) {
          const options = await academicsApi.getOptions({ program_id: programId });
          if (options.periods) {
            // Target period should be OPEN and different from source period
            const availableTargetPeriods = options.periods.filter(
              (p: any) => p.id !== enr.academic_period_id && p.state === 'OPEN'
            );
            setTargetPeriods(availableTargetPeriods);
            if (availableTargetPeriods.length > 0) {
              setTargetPeriodId(availableTargetPeriods[0].id);
            }
          }
        }
      } else {
        setErrorMsg(
          language === 'bn'
            ? 'এই শিক্ষার্থীর কোনো অনুমোদিত (APPROVED) বর্তমান শিক্ষাবর্ষের এনরোলমেন্ট পাওয়া যায়নি।'
            : 'No active APPROVED enrollment found for this student.'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to resolve student academic records');
    }
  };

  // When target period changes, load offerings & sections
  useEffect(() => {
    if (!targetPeriodId || !sourceEnrollment) return;

    const loadOfferings = async () => {
      try {
        const programId = sourceEnrollment.academic_offering?.program_class?.program_id;
        const options = await academicsApi.getOptions({
          program_id: programId,
          academic_period_id: Number(targetPeriodId),
        });

        if (options.offerings) {
          setOfferings(options.offerings);
          // Auto-select matching next stage section if PROMOTE, or same stage section if REPEAT
          const sourceStage = sourceEnrollment.academic_offering?.program_class?.stage_number;
          const desiredStage = action === 'PROMOTE' ? sourceStage + 1 : sourceStage;

          const matchedOffering = options.offerings.find(
            (o: any) => o.program_class?.stage_number === desiredStage
          );

          if (matchedOffering && matchedOffering.sections && matchedOffering.sections.length > 0) {
            setTargetSectionId(matchedOffering.sections[0].id);
          } else if (options.offerings[0]?.sections?.[0]) {
            setTargetSectionId(options.offerings[0].sections[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadOfferings();
  }, [targetPeriodId, action, sourceEnrollment]);

  // Run preview
  const handleRunPreview = async () => {
    if (!selectedStudent || !sourceEnrollment || !targetPeriodId || !targetSectionId) {
      setErrorMsg(language === 'bn' ? 'সকল আবশ্যক তথ্য নির্বাচন করুন।' : 'Please select all required fields.');
      return;
    }

    try {
      setPreviewing(true);
      setErrorMsg(null);
      const res = await promotionsApi.previewIndividual({
        student_id: selectedStudent.student_record_id || selectedStudent.id,
        source_enrollment_id: sourceEnrollment.id,
        target_academic_period_id: Number(targetPeriodId),
        target_offering_section_id: Number(targetSectionId),
        action,
        academic_eligibility_confirmed: eligibilityConfirmed,
      });

      setPreviewResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Preview evaluation failed');
    } finally {
      setPreviewing(false);
    }
  };

  // Execute promotion
  const handleExecute = async () => {
    if (!eligibilityConfirmed) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে একাডেমিক যোগ্যতা যাচাইকরণ বক্সে টিক দিন।'
          : 'Please confirm academic eligibility before proceeding.'
      );
      return;
    }

    try {
      setExecuting(true);
      setErrorMsg(null);
      const res = await promotionsApi.promoteIndividual({
        student_id: selectedStudent.student_record_id || selectedStudent.id,
        source_enrollment_id: sourceEnrollment.id,
        target_academic_period_id: Number(targetPeriodId),
        target_offering_section_id: Number(targetSectionId),
        action,
        academic_eligibility_confirmed: true,
      });

      setExecutionSuccess(res);
      setPreviewResult(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Promotion execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/app/promotions"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'একক শিক্ষার্থী প্রমোশন ও অগ্রগতি' : 'Individual Student Promotion'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'একক শিক্ষার্থীর প্রমোশন বা রিপিট যোগ্যতা যাচাই ও এনরোলমেন্ট সম্পাদন'
                : 'Evaluate eligibility and execute progression for an individual student'}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Banner */}
      {executionSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{executionSuccess.message}</span>
          </div>
          <p className="text-xs text-emerald-700">
            {language === 'bn'
              ? 'শিক্ষার্থীর নতুন এনরোলমেন্ট সফলভাবে তৈরি হয়েছে এবং এটি PENDING_BILLING অবস্থায় হিসাব বিভাগের ছাড়পত্রের অপেক্ষায় রয়েছে।'
              : 'New enrollment has been successfully placed in PENDING_BILLING awaiting financial clearance.'}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              to={`/app/enrollments/${executionSuccess.target_enrollment_id}`}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              {language === 'bn' ? 'এনরোলমেন্ট বিস্তারিত দেখুন' : 'View New Enrollment'}
            </Link>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setSourceEnrollment(null);
                setExecutionSuccess(null);
              }}
              className="px-4 py-2 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              {language === 'bn' ? 'আরেকজন শিক্ষার্থী প্রমোশন করুন' : 'Promote Another Student'}
            </button>
          </div>
        </div>
      )}

      {!executionSuccess && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Search & Student Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === 'bn' ? '১. শিক্ষার্থী অনুসন্ধান' : '1. Search Student'}
              </h2>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'আইডি বা নাম লিখুন...' : 'Enter Student ID or Name...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
                >
                  {searching
                    ? language === 'bn'
                      ? 'অনুসন্ধান চলছে...'
                      : 'Searching...'
                    : language === 'bn'
                    ? 'খুঁজুন'
                    : 'Search'}
                </button>
              </form>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectStudent(item)}
                      className="w-full p-2.5 text-left text-xs hover:bg-teal-50 transition-colors"
                    >
                      <div className="font-semibold text-slate-800">{item.name_en || item.name_bn}</div>
                      <div className="text-[11px] text-slate-500">ID: {item.student_id}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Student Profile Banner */}
              {selectedStudent && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    {language === 'bn' ? selectedStudent.name_bn || selectedStudent.name_en : selectedStudent.name_en}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">ID: {selectedStudent.student_id}</div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'bn' ? 'স্ট্যাটাস: ' : 'Status: '}
                    <span className="font-semibold text-emerald-700">{selectedStudent.status || 'ACTIVE'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Enrollment Info */}
            {sourceEnrollment && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>{language === 'bn' ? 'বর্তমান শ্রেণি ও এনরোলমেন্ট' : 'Current Enrollment'}</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'শিক্ষাবর্ষ:' : 'Period:'}</span>
                    <span className="font-semibold text-slate-800">{sourceEnrollment.academic_period?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'শ্রেণি:' : 'Class:'}</span>
                    <span className="font-semibold text-slate-800">
                      {sourceEnrollment.academic_offering?.program_class?.name_en}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'শাখা:' : 'Section:'}</span>
                    <span className="font-semibold text-slate-800">{sourceEnrollment.offering_section?.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'অবস্থা:' : 'Status:'}</span>
                    <span className="font-semibold text-emerald-700">{sourceEnrollment.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Target Selection & Pre-flight Drawer */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === 'bn' ? '২. লক্ষ্য শিক্ষাবর্ষ ও শ্রেণি নির্ধারণ' : '2. Target Progression Configuration'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Action Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'bn' ? 'পদক্ষেপ (Action)' : 'Progression Action'}
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as 'PROMOTE' | 'REPEAT')}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="PROMOTE">{t('action_promote')}</option>
                    <option value="REPEAT">{t('action_repeat')}</option>
                  </select>
                </div>

                {/* Target Period Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'bn' ? 'লক্ষ্য শিক্ষাবর্ষ (Target Period)' : 'Target Academic Period'}
                  </label>
                  <select
                    value={targetPeriodId}
                    onChange={(e) => setTargetPeriodId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {targetPeriods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Section Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'bn' ? 'লক্ষ্য শ্রেণি ও শাখা (Target Section)' : 'Target Class & Section'}
                  </label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {offerings.flatMap((offering) =>
                      (offering.sections || []).map((sec: any) => (
                        <option key={sec.id} value={sec.id}>
                          {offering.program_class?.name_en} - {sec.code} (ধারণক্ষমতা: {sec.capacity})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                disabled={!selectedStudent || !sourceEnrollment || previewing}
                onClick={handleRunPreview}
                className="w-full py-2.5 bg-teal-700 text-white text-xs font-semibold rounded-xl hover:bg-teal-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {previewing
                    ? language === 'bn'
                      ? 'প্রিভিউ যাচাই হচ্ছে...'
                      : 'Evaluating...'
                    : language === 'bn'
                    ? 'প্রিভিউ যাচাই করুন (Preview Eligibility)'
                    : 'Preview Eligibility'}
                </span>
              </button>
            </div>

            {/* Advisory Preview Drawer / Outcome Card */}
            {previewResult && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {language === 'bn' ? '৩. প্রাক-যাচাই প্রিভিউ ফলাফল' : '3. Pre-Flight Advisory Preview'}
                  </h3>
                  {previewResult.is_eligible ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {language === 'bn' ? 'প্রমোশনের জন্য সম্পূর্ণ যোগ্য' : 'ELIGIBLE FOR PROMOTION'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <ShieldAlert className="w-4 h-4 mr-1.5" />
                      {language === 'bn' ? 'প্রমোশন অনুপযুক্ত' : 'NOT ELIGIBLE'}
                    </span>
                  )}
                </div>

                {/* Errors display */}
                {previewResult.errors.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-2">
                    <div className="text-xs font-bold text-rose-800">
                      {language === 'bn' ? 'নিম্নোক্ত কারণে প্রমোশন সম্ভব নয়:' : 'Progression Blocked by Rules:'}
                    </div>
                    <ul className="list-disc list-inside text-xs text-rose-700 space-y-1">
                      {previewResult.errors.map((err, idx) => (
                        <li key={idx}>
                          <span className="font-mono font-bold mr-1">[{err.code}]</span>
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progression Comparison Map */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <div className="text-slate-400 font-semibold mb-1">
                      {language === 'bn' ? 'বর্তমান পর্যায়' : 'Current Stage'}
                    </div>
                    <div className="font-bold text-slate-800">
                      {previewResult.source_enrollment?.class_name} ({previewResult.source_enrollment?.section_code})
                    </div>
                    <div className="text-[11px] text-slate-500">{previewResult.source_enrollment?.period_label}</div>
                  </div>
                  <div>
                    <div className="text-teal-600 font-semibold mb-1">
                      {language === 'bn' ? 'প্রস্তাবিত লক্ষ্য পর্যায়' : 'Target Destination'}
                    </div>
                    <div className="font-bold text-slate-800">
                      {previewResult.target_offering_section?.class_name} (
                      {previewResult.target_offering_section?.code})
                    </div>
                    <div className="text-[11px] text-slate-500">{previewResult.target_period?.label}</div>
                  </div>
                </div>

                {/* Eligibility Confirmation Checkbox */}
                {previewResult.is_eligible && (
                  <div className="pt-2 space-y-4">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligibilityConfirmed}
                        onChange={(e) => setEligibilityConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        {t('confirm_academic_eligibility')}
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={!eligibilityConfirmed || executing}
                      onClick={handleExecute}
                      className="w-full py-3 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {executing
                          ? language === 'bn'
                            ? 'প্রমোশন কার্যকর হচ্ছে...'
                            : 'Executing Promotion...'
                          : language === 'bn'
                          ? 'প্রমোশন কার্যকর করুন (Execute Promotion)'
                          : 'Execute Promotion'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
