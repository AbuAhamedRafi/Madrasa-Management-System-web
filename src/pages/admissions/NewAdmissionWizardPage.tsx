import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import { academicsApi } from '../../services/academicsApi';
import type { AcademicProgram } from '../../types/academics';
import type { EligibilityResult, SectionCapacity } from '../../types/admissions';
import { CapacityMeter } from '../../components/admissions/CapacityMeter';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const NewAdmissionWizardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const studentId = Number(searchParams.get('student_id') || '0');

  const [step, setStep] = useState<number>(1);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');
  const [catalogs, setCatalogs] = useState<any>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('');
  const [selectedCohortId, setSelectedCohortId] = useState<number | ''>('');
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');

  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [sectionCapacity, setSectionCapacity] = useState<SectionCapacity | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      navigate('/app/admissions/new/student');
      return;
    }
    academicsApi.getPrograms().then(setPrograms).catch(console.error);
  }, [studentId]);

  // Load catalogs when program changes
  useEffect(() => {
    if (!selectedProgramId) {
      setCatalogs(null);
      setSelectedPeriodId('');
      setSelectedCohortId('');
      setSelectedOfferingId('');
      setSelectedSectionId('');
      setSectionCapacity(null);
      return;
    }

    admissionsApi
      .getProgramCatalogs(Number(selectedProgramId))
      .then((data) => {
        setCatalogs(data);
        if (data.periods && data.periods.length > 0) {
          setSelectedPeriodId(data.periods[0].id);
        }
        if (data.cohorts && data.cohorts.length > 0) {
          setSelectedCohortId(data.cohorts[0].id);
        }
      })
      .catch(console.error);
  }, [selectedProgramId]);

  // Verify eligibility when program / period changes
  useEffect(() => {
    if (!selectedProgramId || !studentId) return;

    admissionsApi
      .checkEligibility(studentId, {
        academic_program_id: Number(selectedProgramId),
        academic_period_id: selectedPeriodId ? Number(selectedPeriodId) : undefined,
        academic_cohort_id: selectedCohortId ? Number(selectedCohortId) : undefined,
      })
      .then(setEligibility)
      .catch(console.error);
  }, [selectedProgramId, selectedPeriodId, selectedCohortId]);

  // Check section capacity when selected
  useEffect(() => {
    if (!selectedSectionId) {
      setSectionCapacity(null);
      return;
    }
    admissionsApi
      .getSectionCapacity(Number(selectedSectionId))
      .then(setSectionCapacity)
      .catch(console.error);
  }, [selectedSectionId]);

  const activePeriod = catalogs?.periods?.find((p: any) => p.id === Number(selectedPeriodId));
  const availableOfferings = activePeriod?.offerings || [];
  const activeOffering = availableOfferings.find((o: any) => o.id === Number(selectedOfferingId));
  const availableSections = activeOffering?.sections || [];

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!selectedProgramId || (eligibility && !eligibility.is_eligible)) {
        setError(isBn ? 'অনুগ্রহ করে উপযুক্ত প্রোগ্রাম নির্বাচন করুন।' : 'Please choose an eligible program.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedPeriodId || !selectedSectionId) {
        setError(isBn ? 'অনুগ্রহ করে শিক্ষাবর্ষ ও শাখা নির্বাচন করুন।' : 'Please select period and section.');
        return;
      }
      if (sectionCapacity?.is_full) {
        setError(isBn ? 'নির্বাচিত শাখাটি পূর্ণ। অন্য শাখা নির্বাচন করুন।' : 'Selected section is full.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const enrollment = await admissionsApi.createEnrollment({
        student_record_id: studentId,
        academic_program_id: Number(selectedProgramId),
        academic_period_id: Number(selectedPeriodId),
        academic_cohort_id: selectedCohortId ? Number(selectedCohortId) : undefined,
        offering_section_id: Number(selectedSectionId),
        entry_type: 'REGULAR',
        enrollment_type: 'NEW',
        notes: notes.trim() || undefined,
      });

      navigate(`/app/enrollments/${enrollment.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit admission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-700" />
            {isBn ? 'নতুন শিক্ষার্থী ভর্তি উইজার্ড' : 'New Admission Wizard'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'শিক্ষার্থী যাচাই, প্রোগ্রাম ও শাখা বরাদ্দ এবং ধারণক্ষমতা নিশ্চিতকরণ'
              : 'Student verification, program & section assignment with seat locking'}
          </p>
        </div>

        <Link
          to="/app/admissions/new/student"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'শিক্ষার্থী পরিবর্তন' : 'Change Student'}</span>
        </Link>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
            {isBn ? 'প্রোগ্রাম ও যোগ্যতা' : 'Program & Eligibility'}
          </span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            {isBn ? 'শ্রেণি ও শাখা বরাদ্দ' : 'Class & Section Placement'}
          </span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-semibold ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
            {isBn ? 'চূড়ান্ত নিশ্চিতকরণ' : 'Confirmation'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Program Selection & Eligibility */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            {isBn ? 'ধাপ ১: শিক্ষা প্রোগ্রাম নির্বাচন' : 'Step 1: Select Academic Program'}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {isBn ? 'একাডেমিক প্রোগ্রাম *' : 'Academic Program *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programs.map((p) => {
                const isSelected = selectedProgramId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProgramId(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {isBn ? p.name_bn : p.name_en}
                      </span>
                      <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {p.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {p.scheme === 'CALENDAR_YEAR'
                        ? isBn ? 'ক্যালেন্ডার বর্ষ ভিত্তিক' : 'Calendar-Year Based'
                        : isBn ? 'সেশন/কোহর্ট ভিত্তিক' : 'Session-Based Cohort'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eligibility Feedback */}
          {eligibility && (
            <div
              className={`p-4 rounded-xl border ${
                eligibility.is_eligible
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                {eligibility.is_eligible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isBn ? 'শিক্ষার্থী এই প্রোগ্রামে ভর্তির উপযুক্ত।' : 'Student is eligible for this program.'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{isBn ? 'ভর্তির অযোগ্যতা ধরা পড়েছে:' : 'Eligibility check failed:'}</span>
                  </>
                )}
              </div>

              {!eligibility.is_eligible && eligibility.errors.length > 0 && (
                <ul className="mt-2 text-xs list-disc pl-5 space-y-1">
                  {eligibility.errors.map((e, idx) => (
                    <li key={idx}>{e.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!selectedProgramId || !!(eligibility && !eligibility.is_eligible)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>{isBn ? 'পরবর্তী ধাপ' : 'Proceed to Placement'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Placement (Period, Class, Section) */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            {isBn ? 'ধাপ ২: শিক্ষাবর্ষ ও শ্রেণি বরাদ্দ' : 'Step 2: Period & Section Placement'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'শিক্ষাবর্ষ / পিরিয়ড *' : 'Study Period *'}
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => {
                  setSelectedPeriodId(Number(e.target.value));
                  setSelectedOfferingId('');
                  setSelectedSectionId('');
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              >
                <option value="">{isBn ? '-- শিক্ষাবর্ষ নির্বাচন --' : '-- Choose Period --'}</option>
                {catalogs?.periods?.map((pd: any) => (
                  <option key={pd.id} value={pd.id}>
                    {pd.label} ({pd.state})
                  </option>
                ))}
              </select>
            </div>

            {catalogs?.scheme === 'SESSION_BASED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'কোহর্ট (সেশন ব্যাচ) *' : 'Academic Cohort *'}
                </label>
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                >
                  <option value="">{isBn ? '-- কোহর্ট নির্বাচন --' : '-- Choose Cohort --'}</option>
                  {catalogs?.cohorts?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.intake_year})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Class Offering */}
          {selectedPeriodId && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'অফারকৃত শ্রেণি ও ট্র্যাক *' : 'Offered Class & Track *'}
              </label>
              <select
                value={selectedOfferingId}
                onChange={(e) => {
                  setSelectedOfferingId(Number(e.target.value));
                  setSelectedSectionId('');
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              >
                <option value="">{isBn ? '-- শ্রেণি নির্বাচন করুন --' : '-- Select Class --'}</option>
                {availableOfferings.map((off: any) => (
                  <option key={off.id} value={off.id}>
                    {isBn ? off.program_class?.name_bn : off.program_class?.name_en}
                    {off.track ? ` [${isBn ? off.track.name_bn : off.track.name_en}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section Selection with Capacity Meter */}
          {selectedOfferingId && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {isBn ? 'শাখা (Section) ও আসন ধারণক্ষমতা *' : 'Section & Seat Capacity *'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSections.map((sec: any) => {
                  const isSelected = selectedSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 text-xs mb-2">
                        {isBn ? sec.name_bn : sec.name_en} ({sec.code})
                      </div>
                      <div className="text-xs text-slate-500">
                        {isBn ? `মোট আসন: ${sec.capacity}` : `Total Capacity: ${sec.capacity}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real-time Capacity Meter */}
          {sectionCapacity && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <CapacityMeter capacity={sectionCapacity} />
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'পূর্ববর্তী ধাপ' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!selectedPeriodId || !selectedSectionId || !!sectionCapacity?.is_full}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>{isBn ? 'নিশ্চিতকরণ ধাপে যান' : 'Review & Confirm'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            {isBn ? 'ধাপ ৩: ভর্তি আবেদন পর্যালোচনা ও জমা' : 'Step 3: Review & Submit Admission'}
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">{isBn ? 'প্রোগ্রাম:' : 'Program:'}</span>
              <span className="font-bold text-slate-900">
                {isBn ? catalogs?.name_bn : catalogs?.name_en} ({catalogs?.code})
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">{isBn ? 'শিক্ষাবর্ষ:' : 'Study Period:'}</span>
              <span className="font-semibold text-slate-900">{activePeriod?.label}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">{isBn ? 'শ্রেণি:' : 'Class:'}</span>
              <span className="font-semibold text-slate-900">
                {isBn ? activeOffering?.program_class?.name_bn : activeOffering?.program_class?.name_en}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">{isBn ? 'নির্ধারিত শাখা:' : 'Assigned Section:'}</span>
              <span className="font-bold text-teal-700">
                {isBn ? sectionCapacity?.section_name_bn : sectionCapacity?.section_name_en} (
                {sectionCapacity?.section_code})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'প্রারম্ভিক অবস্থা:' : 'Initial Status:'}</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                {isBn ? 'PENDING_BILLING (বিলিং অপেক্ষমাণ)' : 'PENDING_BILLING'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'প্রশাসনিক মন্তব্য / নোট (ঐচ্ছিক)' : 'Administrative Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBn ? 'ভর্তি সংক্রান্ত কোনো বিশেষ মন্তব্য...' : 'Any special notes regarding this admission...'}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'পূর্ববর্তী ধাপ' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? (
                <span>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBn ? 'ভর্তি আবেদন জমা দিন' : 'Submit Admission'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
