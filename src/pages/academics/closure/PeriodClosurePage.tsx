import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { academicsApi } from '../../../services/academicsApi';
import type { AcademicPeriod, PeriodState } from '../../../types/academics';
import { SelectedPeriodCard } from './components/SelectedPeriodCard';
import { PeriodLifecycleConfirmCard } from './components/PeriodLifecycleConfirmCard';
import { AuditHistoryDrawer } from '../../../components/academics/AuditHistoryDrawer';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export const PeriodClosurePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const { hasPermission } = useAuth();

  const [period, setPeriod] = useState<AcademicPeriod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canClosePeriods = hasPermission('academics.close_periods');

  const loadPeriod = async () => {
    if (!id) return;
    const data = await academicsApi.getPeriod(Number(id));
    setPeriod(data);
  };

  useEffect(() => {
    loadPeriod();
  }, [id]);

  const handleTransition = async (targetState: PeriodState, reason: string) => {
    if (!period) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await academicsApi.updatePeriodStatus(period.id, {
        state: targetState,
        lock_version: period.lock_version,
        reason: reason || undefined,
      });
      await loadPeriod();
      setSuccessMsg(
        isBn
          ? 'শিক্ষাবর্ষের অবস্থা সফলভাবে হালনাগাদ হয়েছে।'
          : 'Study period lifecycle state updated successfully.'
      );
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to transition period state.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/app/academics/periods"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isBn ? 'সেশন ও শিক্ষাবর্ষ তালিকায় ফিরে যান' : 'Back to Cohorts & Study Periods'}
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          {isBn
            ? 'শিক্ষাবর্ষ লাইফসাইকেল, ক্লোজার ও অডিট ইতিহাস'
            : 'Study Period Lifecycle, Closure & Audit History'}
        </h1>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {successMsg}
        </div>
      )}

      {period && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <SelectedPeriodCard period={period} />
            <PeriodLifecycleConfirmCard
              period={period}
              canClosePeriods={canClosePeriods}
              onTransition={handleTransition}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {isBn ? 'অপরিবর্তনীয় অডিট ইতিহাস' : 'Immutable Lifecycle Audit Trail'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn
                    ? 'এই শিক্ষাবর্ষের সকল অবস্থা পরিবর্তনের লগ ও কারণ'
                    : 'Every open, close and reopen action recorded for this period'}
                </p>
              </div>
              <AuditHistoryDrawer entries={period.audit_history ?? []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

