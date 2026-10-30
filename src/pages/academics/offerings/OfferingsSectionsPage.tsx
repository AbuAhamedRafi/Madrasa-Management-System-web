import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { academicsApi } from '../../../services/academicsApi';
import type {
  AcademicOffering,
  AcademicPeriod,
  AcademicProgram,
  AcademicTrack,
  ProgramClass,
} from '../../../types/academics';
import { ReusableClassesCard } from './components/ReusableClassesCard';
import { OfferingsSectionsTableCard } from './components/OfferingsSectionsTableCard';
import { AddSectionModal } from './components/AddSectionModal';
import { PeriodStatusChip } from '../../../components/academics/PeriodStatusChip';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

export const OfferingsSectionsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    searchParams.get('program_id') ? Number(searchParams.get('program_id')) : null
  );
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(
    searchParams.get('academic_period_id')
      ? Number(searchParams.get('academic_period_id'))
      : null
  );
  const [classes, setClasses] = useState<ProgramClass[]>([]);
  const [tracks, setTracks] = useState<AcademicTrack[]>([]);
  const [offerings, setOfferings] = useState<AcademicOffering[]>([]);
  const [activeOfferingForSection, setActiveOfferingForSection] =
    useState<AcademicOffering | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const canManageOfferings = hasPermission('academics.manage_offerings');

  useEffect(() => {
    academicsApi.getPrograms().then((data) => {
      setPrograms(data);
      if (!selectedProgramId && data.length > 0) {
        setSelectedProgramId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return;
    setLoading(true);
    setPeriods([]);
    setClasses([]);
    setTracks([]);
    setOfferings([]);
    setSelectedPeriodId(null);

    Promise.all([
      academicsApi.getPeriods({ program_id: selectedProgramId }),
      academicsApi.getClasses(selectedProgramId),
      academicsApi.getTracks(selectedProgramId),
    ])
      .then(([periodData, clsData, trkData]) => {
        setPeriods(periodData);
        setClasses(clsData);
        setTracks(trkData);
        if (periodData.length > 0) {
          setSelectedPeriodId(periodData[0].id);
        } else {
          setSelectedPeriodId(null);
          setOfferings([]);
        }
      })
      .catch((err: any) => {
        setError(err?.response?.data?.error?.message || 'Failed to load program data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedProgramId]);

  const loadOfferings = async () => {
    if (!selectedPeriodId) {
      setOfferings([]);
      return;
    }
    try {
      const data = await academicsApi.getOfferings(selectedPeriodId);
      setOfferings(data);
    } catch {
      setOfferings([]);
    }
  };

  useEffect(() => {
    if (selectedPeriodId) {
      loadOfferings();
    } else {
      setOfferings([]);
    }
  }, [selectedPeriodId]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;

  const handleAddOffering = async (classId: number, trackId: number | null) => {
    if (!selectedPeriodId) return;
    try {
      setError(null);
      await academicsApi.createOffering({
        academic_period_id: selectedPeriodId,
        program_class_id: classId,
        academic_track_id: trackId,
      });
      await loadOfferings();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add offering.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isBn ? 'ক্লাস অফারিং ও শাখা (Sections) ব্যবস্থাপনা' : 'Class Offerings & Sections'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isBn
              ? 'পুনর্ব্যবহারযোগ্য ক্লাসগুলোকে নির্দিষ্ট শিক্ষাবর্ষে অফার করুন এবং শাখা (Section) পরিচালনা করুন'
              : 'Map reusable program classes into specific study periods and configure sections'}
          </p>
        </div>

        {selectedPeriod && (
          <Link
            to={`/app/academics/periods/${selectedPeriod.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-teal-700 hover:bg-teal-50"
          >
            <Lock className="w-4 h-4" />
            {isBn ? 'পিরিয়ড ক্লোজার ও লাইফসাইকেল' : 'Period Closure & Lifecycle'}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {isBn ? 'প্রোগ্রাম:' : 'Program:'}
          </label>
          <select
            value={selectedProgramId ?? ''}
            onChange={(e) => setSelectedProgramId(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {isBn ? p.name_bn : p.name_en} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">
            {isBn ? 'শিক্ষাবর্ষ / পিরিয়ড:' : 'Study Period:'}
          </label>
          <select
            value={selectedPeriodId ?? ''}
            onChange={(e) =>
              setSelectedPeriodId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={periods.length === 0 || loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium disabled:bg-slate-100 disabled:text-slate-400"
          >
            {periods.length === 0 ? (
              <option value="">
                {isBn ? '-- কোনো শিক্ষাবর্ষ নেই --' : '-- No Study Periods --'}
              </option>
            ) : (
              periods.map((pd) => (
                <option key={pd.id} value={pd.id}>
                  {pd.label} ({pd.state})
                </option>
              ))
            )}
          </select>
        </div>

        {selectedPeriod && <PeriodStatusChip state={selectedPeriod.state} />}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <ReusableClassesCard
            period={selectedPeriod}
            classes={classes}
            tracks={tracks}
            canManageOfferings={canManageOfferings}
            onAddOffering={handleAddOffering}
          />
        </div>

        <div className="lg:col-span-8">
          <OfferingsSectionsTableCard
            offerings={offerings}
            isPeriodClosed={selectedPeriod?.state === 'CLOSED'}
            canManageOfferings={canManageOfferings}
            onOpenAddSection={setActiveOfferingForSection}
          />
        </div>
      </div>

      <AddSectionModal
        offering={activeOfferingForSection}
        onClose={() => setActiveOfferingForSection(null)}
        onCreated={loadOfferings}
      />
    </div>
  );
};
