import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UsersRound,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { promotionsApi } from '../../services/promotionsApi';
import { academicsApi } from '../../services/academicsApi';

export const NewBulkBatchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('bn') ? 'bn' : 'en';
  const navigate = useNavigate();

  // Program selection
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');

  // Source selections
  const [sourcePeriods, setSourcePeriods] = useState<any[]>([]);
  const [sourcePeriodId, setSourcePeriodId] = useState<number | ''>('');
  const [sourceSections, setSourceSections] = useState<any[]>([]);
  const [sourceSectionId, setSourceSectionId] = useState<string>(''); // empty string means entire grade

  // Target selections
  const [targetPeriods, setTargetPeriods] = useState<any[]>([]);
  const [targetPeriodId, setTargetPeriodId] = useState<number | ''>('');
  const [targetOfferings, setTargetOfferings] = useState<any[]>([]);
  const [targetOfferingId, setTargetOfferingId] = useState<number | ''>('');
  const [defaultSectionId, setDefaultSectionId] = useState<number | ''>('');

  // Config
  const [action, setAction] = useState<'PROMOTE' | 'REPEAT'>('PROMOTE');
  const [confirmEligibility, setConfirmEligibility] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const options = await academicsApi.getOptions();
        if (options.programs) {
          setPrograms(options.programs);
          if (options.programs.length > 0) {
            setSelectedProgramId(options.programs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      }
    };
    fetchPrograms();
  }, []);

  // When program changes, load source periods
  useEffect(() => {
    if (!selectedProgramId) return;

    const fetchProgramDetails = async () => {
      try {
        const options = await academicsApi.getOptions({ program_id: Number(selectedProgramId) });
        if (options.periods) {
          setSourcePeriods(options.periods);
          if (options.periods.length > 0) {
            setSourcePeriodId(options.periods[0].id);
          }

          // Target periods: OPEN periods
          const openPeriods = options.periods.filter((p: any) => p.state === 'OPEN');
          setTargetPeriods(openPeriods);
          if (openPeriods.length > 0) {
            setTargetPeriodId(openPeriods[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProgramDetails();
  }, [selectedProgramId]);

  // When source period changes, load source sections
  useEffect(() => {
    if (!selectedProgramId || !sourcePeriodId) return;

    const fetchSourceOfferings = async () => {
      try {
        const options = await academicsApi.getOptions({
          program_id: Number(selectedProgramId),
          academic_period_id: Number(sourcePeriodId),
        });
        if (options.offerings) {
          const allSections = options.offerings.flatMap((o: any) =>
            (o.sections || []).map((s: any) => ({
              ...s,
              className: o.program_class?.name_en || '',
            }))
          );
          setSourceSections(allSections);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSourceOfferings();
  }, [selectedProgramId, sourcePeriodId]);

  // When target period changes, load target offerings & sections
  useEffect(() => {
    if (!selectedProgramId || !targetPeriodId) return;

    const fetchTargetOfferings = async () => {
      try {
        const options = await academicsApi.getOptions({
          program_id: Number(selectedProgramId),
          academic_period_id: Number(targetPeriodId),
        });
        if (options.offerings) {
          setTargetOfferings(options.offerings);
          if (options.offerings.length > 0) {
            setTargetOfferingId(options.offerings[0].id);
            if (options.offerings[0].sections && options.offerings[0].sections.length > 0) {
              setDefaultSectionId(options.offerings[0].sections[0].id);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTargetOfferings();
  }, [selectedProgramId, targetPeriodId]);

  // When target offering changes, update default section
  useEffect(() => {
    if (!targetOfferingId) return;
    const offering = targetOfferings.find((o) => o.id === Number(targetOfferingId));
    if (offering && offering.sections && offering.sections.length > 0) {
      setDefaultSectionId(offering.sections[0].id);
    }
  }, [targetOfferingId, targetOfferings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePeriodId || !targetPeriodId || !targetOfferingId) {
      setErrorMsg(language === 'bn' ? 'সকল আবশ্যক তথ্য নির্বাচন করুন।' : 'Please select all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const batch = await promotionsApi.createBatch({
        mode: 'BULK',
        action,
        source_academic_period_id: Number(sourcePeriodId),
        source_offering_section_id: sourceSectionId ? Number(sourceSectionId) : null,
        target_academic_period_id: Number(targetPeriodId),
        target_academic_offering_id: Number(targetOfferingId),
        default_target_section_id: defaultSectionId ? Number(defaultSectionId) : undefined,
        academic_eligibility_confirmed: confirmEligibility,
        notes: notes.trim() || undefined,
      });

      navigate(`/app/promotions/batches/${batch.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create promotion batch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/app/promotions"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {language === 'bn' ? 'নতুন বাল্ক প্রমোশন ব্যাচ তৈরি' : 'Create New Bulk Promotion Batch'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'একটি নির্দিষ্ট শিক্ষাবর্ষ ও শ্রেণির সকল শিক্ষার্থীকে একসাথে পরবর্তী শিক্ষাবর্ষে উন্নীত করার কনফিগারেশন'
              : 'Configure and populate a bulk cohort progression batch for an academic period'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        {/* Section 1: Program and Action */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            {language === 'bn' ? '১. প্রোগ্রাম ও প্রমোশন রূপরেখা' : '1. Program & Progression Type'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'একাডেমিক প্রোগ্রাম' : 'Academic Program'}
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {language === 'bn' ? prog.name_bn || prog.name_en : prog.name_en} ({prog.scheme})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'পদক্ষেপের ধরন (Action)' : 'Progression Action'}
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
          </div>
        </div>

        {/* Section 2: Source Period and Scope */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            {language === 'bn' ? '২. উৎস শিক্ষাবর্ষ ও পরিধি' : '2. Source Academic Period & Scope'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'বর্তমান শিক্ষাবর্ষ (Source Period)' : 'Source Academic Period'}
              </label>
              <select
                value={sourcePeriodId}
                onChange={(e) => setSourcePeriodId(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {sourcePeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'নির্দিষ্ট শাখা (ঐচ্ছিক)' : 'Source Section (Optional)'}
              </label>
              <select
                value={sourceSectionId}
                onChange={(e) => setSourceSectionId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">{language === 'bn' ? 'সকল শাখা (সমগ্র শ্রেণি)' : 'All Sections (Whole Grade)'}</option>
                {sourceSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.className} - {sec.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Target Destination */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            {language === 'bn' ? '৩. লক্ষ্য শিক্ষাবর্ষ ও শ্রেণি বরাদ্দ' : '3. Target Destination & Section'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'পরবর্তী শিক্ষাবর্ষ (Target Period)' : 'Target Academic Period'}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'লক্ষ্য শ্রেণি (Target Class)' : 'Target Class / Offering'}
              </label>
              <select
                value={targetOfferingId}
                onChange={(e) => setTargetOfferingId(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {targetOfferings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {language === 'bn'
                      ? offering.program_class?.name_bn || offering.program_class?.name_en
                      : offering.program_class?.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'ডিফল্ট শাখা (Default Section)' : 'Default Target Section'}
              </label>
              <select
                value={defaultSectionId}
                onChange={(e) => setDefaultSectionId(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {targetOfferings
                  .find((o) => o.id === Number(targetOfferingId))
                  ?.sections?.map((sec: any) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.code} (ধারণক্ষমতা: {sec.capacity})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Eligibility & Notes */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            {language === 'bn' ? '৪. অনুমোদন ও মন্তব্য' : '4. Confirmation & Notes'}
          </h2>
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmEligibility}
                onChange={(e) => setConfirmEligibility(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                {t('confirm_academic_eligibility')}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'bn' ? 'অডিট ও প্রশাসনিক মন্তব্য (Notes)' : 'Audit Notes'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'bn' ? 'প্রমোশন ব্যাচ সংক্রান্ত কোনো বিশেষ নির্দেশনা...' : 'Optional notes for this batch...'}
              className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Link
            to="/app/promotions"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <UsersRound className="w-4 h-4" />
            <span>
              {submitting
                ? language === 'bn'
                  ? 'ব্যাচ তৈরি হচ্ছে...'
                  : 'Creating Batch...'
                : language === 'bn'
                ? 'ব্যাচ তৈরি করুন ও তালিকা প্রস্তুত করুন'
                : 'Create Batch & Populate Students'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
