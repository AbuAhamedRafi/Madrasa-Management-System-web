import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { SectionCapacity } from '../../types/admissions';
import { CapacityMeter } from '../../components/admissions/CapacityMeter';
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

export const CapacityConflictAlternativePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const offeringId = Number(searchParams.get('offering_id') || '0');
  const studentId = Number(searchParams.get('student_id') || '0');
  const programId = Number(searchParams.get('program_id') || '0');
  const periodId = Number(searchParams.get('period_id') || '0');

  const [sections, setSections] = useState<SectionCapacity[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offeringId) return;
    setLoading(true);
    admissionsApi
      .getAlternativeSections(offeringId)
      .then((data) => {
        setSections(data);
        const firstAvailable = data.find((s) => !s.is_full);
        if (firstAvailable) {
          setSelectedSectionId(firstAvailable.section_id);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || 'Failed to load alternative sections.');
      })
      .finally(() => setLoading(false));
  }, [offeringId]);

  const handleSelectAlternative = () => {
    if (!selectedSectionId) return;
    navigate(
      `/app/admissions/new/academic?student_id=${studentId}&program_id=${programId}&period_id=${periodId}&section_id=${selectedSectionId}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <span>{isBn ? 'আসন পূর্ণতা ও বিকল্প শাখা নির্বাচন' : 'Section Full: Alternative Placement'}</span>
        </h1>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'ফিরে যান' : 'Go Back'}</span>
        </button>
      </div>

      {/* Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
        <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{isBn ? 'নির্বাচিত শাখার আসন ধারণক্ষমতা পূর্ণ হয়েছে' : 'Target Section Reached Full Capacity'}</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          {isBn
            ? 'পেসিমিস্টিক কনকারেন্সি নিয়ন্ত্রণের কারণে অতিরিক্ত আসন বরাদ্দ প্রতিহত করা হয়েছে। নিচে একই শ্রেণির অন্যান্য উপলব্ধ শাখা থেকে আসন নির্বাচন করুন।'
            : 'Section capacity limit reached. Please select an alternative section under the same class offering below.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Alternative Sections List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {isBn ? 'উপলব্ধ বিকল্প শাখাসমূহ' : 'Available Alternative Sections'}
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {isBn ? 'বিকল্প শাখা লোড হচ্ছে...' : 'Loading alternative sections...'}
          </div>
        ) : sections.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isBn ? 'এই শ্রেণির কোনো বিকল্প শাখা নেই।' : 'No alternative sections available for this class.'}
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec) => {
              const isSelected = selectedSectionId === sec.section_id;
              return (
                <div
                  key={sec.section_id}
                  onClick={() => !sec.is_full && setSelectedSectionId(sec.section_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    sec.is_full
                      ? 'opacity-60 cursor-not-allowed bg-rose-50/20 border-rose-200'
                      : isSelected
                      ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CapacityMeter capacity={sec} />
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3">
          <button
            type="button"
            onClick={handleSelectAlternative}
            disabled={!selectedSectionId}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <span>{isBn ? 'নির্বাচিত বিকল্প শাখা নিয়ে এগিয়ে যান' : 'Continue with Selected Alternative'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
