import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { academicsApi } from '../../../services/academicsApi';
import type { AcademicCohort, AcademicPeriod, AcademicProgram } from '../../../types/academics';
import { AdmissionCohortsCard } from './components/AdmissionCohortsCard';
import { StudyPeriodsTimelineCard } from './components/StudyPeriodsTimelineCard';
import { CreateCohortModal } from './components/CreateCohortModal';
import { CreatePeriodModal } from './components/CreatePeriodModal';
import { SchemeBadge } from '../../../components/academics/SchemeBadge';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const CohortPeriodsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    searchParams.get('program_id') ? Number(searchParams.get('program_id')) : null
  );
  const [cohorts, setCohorts] = useState<AcademicCohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const canManageCohorts = hasPermission('academics.manage_cohorts');
  const canManagePeriods = hasPermission('academics.manage_periods');

  useEffect(() => {
    academicsApi.getPrograms().then((data) => {
      setPrograms(data);
      if (!selectedProgramId && data.length > 0) {
        setSelectedProgramId(data[0].id);
      }
    });
  }, []);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || null;

  const loadCohortsAndPeriods = async () => {
    if (!selectedProgramId) return;
    const [cohortData, periodData] = await Promise.all([
      academicsApi.getCohorts(selectedProgramId),
      academicsApi.getPeriods({
        program_id: selectedProgramId,
        cohort_id: selectedCohortId ?? undefined,
      }),
    ]);
    setCohorts(cohortData);
    setPeriods(periodData);
  };

  useEffect(() => {
    loadCohortsAndPeriods();
  }, [selectedProgramId, selectedCohortId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {isBn ? 'ভর্তি সেশন (Cohorts) ও শিক্ষাবর্ষ (Study Periods)' : 'Cohorts & Study Periods'}
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          {isBn
            ? 'সেশন-ভিত্তিক ও বার্ষিক প্রোগ্রামের জন্য ভর্তি ব্যাচ এবং সুনির্দিষ্ট শিক্ষাবর্ষ পরিচালনা করুন'
            : 'Manage admission cohorts and explicit study periods for session-based and year-based programs'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">
            {isBn ? 'প্রোগ্রাম নির্বাচন:' : 'Select Program:'}
          </label>
          <select
            value={selectedProgramId ?? ''}
            onChange={(e) => {
              setSelectedCohortId(null);
              setSelectedProgramId(Number(e.target.value));
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {isBn ? p.name_bn : p.name_en} ({p.code})
              </option>
            ))}
          </select>
        </div>

        {selectedProgram && (
          <div className="flex items-center gap-2">
            <SchemeBadge scheme={selectedProgram.scheme} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <AdmissionCohortsCard
            program={selectedProgram}
            cohorts={cohorts}
            selectedCohortId={selectedCohortId}
            onSelectCohort={setSelectedCohortId}
            canManageCohorts={canManageCohorts}
            onOpenCreate={() => setShowCohortModal(true)}
          />
        </div>

        <div className="lg:col-span-8">
          <StudyPeriodsTimelineCard
            periods={periods}
            canManagePeriods={canManagePeriods}
            onOpenCreatePeriod={() => setShowPeriodModal(true)}
          />
        </div>
      </div>

      {selectedProgram && (
        <>
          <CreateCohortModal
            isOpen={showCohortModal}
            programId={selectedProgram.id}
            onClose={() => setShowCohortModal(false)}
            onCreated={loadCohortsAndPeriods}
          />
          <CreatePeriodModal
            isOpen={showPeriodModal}
            program={selectedProgram}
            cohorts={cohorts}
            onClose={() => setShowPeriodModal(false)}
            onCreated={loadCohortsAndPeriods}
          />
        </>
      )}
    </div>
  );
};
