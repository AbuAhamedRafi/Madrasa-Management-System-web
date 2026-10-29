import React from 'react';
import type { AcademicPeriod } from '../../../../types/academics';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { SchemeBadge } from '../../../../components/academics/SchemeBadge';
import { useTranslation } from 'react-i18next';
import { Calendar, ShieldAlert } from 'lucide-react';

interface Props {
  period: AcademicPeriod;
}

export const SelectedPeriodCard: React.FC<Props> = ({ period }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">{period.label}</h2>
            <PeriodStatusChip state={period.state} />
          </div>
          {period.program && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700">
                {isBn ? period.program.name_bn : period.program.name_en} ({period.program.code})
              </span>
              <SchemeBadge scheme={period.program.scheme} />
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-500">
          <div>Lock Version: #{period.lock_version}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500">{isBn ? 'সময়সীমা' : 'Date Window'}</div>
          <div className="font-semibold text-slate-900 mt-1 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            {period.start_date} → {period.end_date}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500">{isBn ? 'ভর্তি সেশন / বর্ষ' : 'Cohort / Year'}</div>
          <div className="font-semibold text-slate-900 mt-1">
            {period.cohort
              ? `${period.cohort.label} (Stage #${period.study_year_number})`
              : `${period.calendar_year ?? '—'}`}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-slate-500">{isBn ? 'অফারকৃত ক্লাস সংখ্যা' : 'Attached Offerings'}</div>
          <div className="font-semibold text-slate-900 mt-1">
            {period.offerings?.length ?? 0} {isBn ? 'টি অফারিং' : 'Offerings'}
          </div>
        </div>
      </div>

      {period.state === 'CLOSED' && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            {isBn
              ? 'এই শিক্ষাবর্ষটি বর্তমানে বন্ধ (CLOSED) অবস্থায় রয়েছে। পুনরায় খোলা (Reopen) ছাড়া এতে কোনো নতুন অফারিং বা শাখা পরিবর্তন করা যাবে না।'
              : 'This study period is currently CLOSED. Structural mutations to its offerings or sections are blocked unless reopened with an audit reason.'}
          </span>
        </div>
      )}
    </div>
  );
};

