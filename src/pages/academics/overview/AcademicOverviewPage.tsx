import React, { useEffect, useState } from 'react';
import { academicsApi } from '../../../services/academicsApi';
import type { AcademicPeriod, AcademicProgram, AcademicSummary } from '../../../types/academics';
import { SummaryMetricsGrid } from './components/SummaryMetricsGrid';
import { ProgramSummaryTable } from './components/ProgramSummaryTable';
import { ActivePeriodsCard } from './components/ActivePeriodsCard';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Network, CalendarRange, Layers, Building2 } from 'lucide-react';

export const AcademicOverviewPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();

  const [metrics, setMetrics] = useState<AcademicSummary | null>(null);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (programId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, progData, periodData] = await Promise.all([
        academicsApi.getSummary(programId),
        academicsApi.getPrograms(),
        academicsApi.getPeriods(programId ? { program_id: programId } : undefined),
      ]);
      setMetrics(sumData);
      setPrograms(progData);
      setPeriods(periodData);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load academic overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedProgramId);
  }, [selectedProgramId]);

  const canManageStructure = hasPermission('academics.manage_structure');

  const filteredPrograms = selectedProgramId
    ? programs.filter((p) => p.id === selectedProgramId)
    : programs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isBn ? 'একাডেমিক ওভারভিউ ও কাঠামো সারসংক্ষেপ' : 'Academic Structure Overview'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isBn
              ? 'মাদ্রাসার বিভাগ, প্রোগ্রাম (আলিয়া, কওমি, হিফজ), সেশন ও শিক্ষাবর্ষের কেন্দ্রীয় ড্যাশবোর্ড'
              : 'Central overview of departments, programs (Alia, Qawmi, Hifz), cohorts and study periods'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/app/academics/structure"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Network className="w-4 h-4 text-teal-700" />
            {isBn ? 'শিক্ষা কাঠামো ট্রি' : 'Hierarchy Tree'}
          </Link>
          <Link
            to="/app/academics/departments"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            {isBn ? 'বিভাগসমূহ' : 'Departments'}
          </Link>
          <Link
            to="/app/academics/periods"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <CalendarRange className="w-4 h-4 text-teal-700" />
            {isBn ? 'সেশন ও শিক্ষাবর্ষ' : 'Cohorts & Periods'}
          </Link>
          <Link
            to="/app/academics/offerings"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Layers className="w-4 h-4 text-teal-700" />
            {isBn ? 'ক্লাস ও শাখা' : 'Offerings & Sections'}
          </Link>
        </div>
      </div>

      {/* Program Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {isBn ? 'প্রোগ্রাম ফিল্টার:' : 'Filter by Program:'}
          </span>
          <select
            value={selectedProgramId ?? ''}
            onChange={(e) =>
              setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">{isBn ? 'সকল প্রোগ্রাম' : 'All Programs'}</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {isBn ? p.name_bn : p.name_en} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && !metrics ? (
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          {isBn ? 'একাডেমিক তথ্য লোড হচ্ছে...' : 'Loading academic structure summary...'}
        </div>
      ) : (
        metrics && (
          <>
            <SummaryMetricsGrid metrics={metrics} />
            <ProgramSummaryTable
              programs={filteredPrograms}
              canManageStructure={canManageStructure}
            />
            <ActivePeriodsCard periods={periods} />
          </>
        )
      )}
    </div>
  );
};
