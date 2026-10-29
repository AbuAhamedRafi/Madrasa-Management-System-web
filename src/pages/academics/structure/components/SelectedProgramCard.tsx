import React from 'react';
import type { AcademicProgram } from '../../../../types/academics';
import { SchemeBadge } from '../../../../components/academics/SchemeBadge';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Edit3, Layers, CalendarRange, Lock } from 'lucide-react';

interface Props {
  structure: AcademicProgram | null;
  canManageStructure: boolean;
}

export const SelectedProgramCard: React.FC<Props> = ({ structure, canManageStructure }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  if (!structure) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">
        {isBn
          ? 'বাম পাশের ট্রি থেকে যেকোনো একটি প্রোগ্রাম নির্বাচন করুন।'
          : 'Select a program from the hierarchy tree on the left to inspect its classes, tracks, and sessions.'}
      </div>
    );
  }

  const classes = structure.classes ?? [];
  const tracks = structure.tracks ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">
              {isBn ? structure.name_bn : structure.name_en}
            </h3>
            <PeriodStatusChip state={structure.state} />
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{structure.code}</div>
          <div className="mt-2">
            <SchemeBadge scheme={structure.scheme} />
          </div>
        </div>

        {canManageStructure && (
          <Link
            to={`/app/academics/programs/${structure.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isBn ? 'প্রোগ্রাম সম্পাদনা' : 'Edit Program'}
          </Link>
        )}
      </div>

      {structure.has_dependencies && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            {isBn
              ? 'এই প্রোগ্রামের অধীনে সেশন বা শিক্ষাবর্ষ থাকায় এর একাডেমিক স্কিম অপরিবর্তনীয় (Locked)।'
              : 'Academic scheme is locked because dependent cohorts or study periods exist.'}
          </span>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {isBn ? 'পুনর্ব্যবহারযোগ্য ক্লাস / জামাত' : 'Reusable Program Classes'} ({classes.length})
        </h4>
        <div className="space-y-1.5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900">
                  {isBn ? cls.name_bn : cls.name_en}
                </span>{' '}
                <span className="font-mono text-slate-500">({cls.code})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                {isBn ? `স্তর/বর্ষ #${cls.stage_number}` : `Stage #${cls.stage_number}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {isBn ? 'একাডেমিক বিভাগ / গ্রুপ (Tracks)' : 'Academic Tracks / Streams'} ({tracks.length})
        </h4>
        {tracks.length === 0 ? (
          <div className="text-xs text-slate-400">
            {isBn ? 'কোনো আলাদা গ্রুপ/ট্র্যাক নেই (সাধারণ)' : 'No separate tracks (General)'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tracks.map((trk) => (
              <span
                key={trk.id}
                className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium"
              >
                {isBn ? trk.name_bn : trk.name_en} ({trk.code})
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
        <Link
          to={`/app/academics/periods?program_id=${structure.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <CalendarRange className="w-3.5 h-3.5 text-teal-700" />
          {isBn ? 'সেশন ও শিক্ষাবর্ষ' : 'Cohorts & Periods'}
        </Link>
        <Link
          to={`/app/academics/offerings?program_id=${structure.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Layers className="w-3.5 h-3.5 text-teal-700" />
          {isBn ? 'ক্লাস অফারিং ও শাখা' : 'Offerings & Sections'}
        </Link>
      </div>
    </div>
  );
};
