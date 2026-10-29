import React from 'react';
import type { AcademicProgram } from '../../../../types/academics';
import { SchemeBadge } from '../../../../components/academics/SchemeBadge';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Edit3, Layers } from 'lucide-react';

interface Props {
  programs: AcademicProgram[];
  canManageStructure: boolean;
}

export const ProgramSummaryTable: React.FC<Props> = ({ programs, canManageStructure }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {isBn ? 'একাডেমিক প্রোগ্রাম ও স্কিম ম্যাট্রিক্স' : 'Academic Program & Scheme Matrix'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'বিভাগ, বোর্ড/ধারা, প্রোগ্রাম স্কিম এবং মেয়াদের সারসংক্ষেপ'
              : 'Summary of departments, board/authority, scheme and duration'}
          </p>
        </div>
        {canManageStructure && (
          <Link
            to="/app/academics/programs/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition"
          >
            + {isBn ? 'নতুন প্রোগ্রাম' : 'New Program'}
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">{isBn ? 'প্রোগ্রাম' : 'Program'}</th>
              <th className="py-3 px-4">{isBn ? 'বিভাগ ও বোর্ড' : 'Department & Board'}</th>
              <th className="py-3 px-4">{isBn ? 'স্কিম' : 'Scheme'}</th>
              <th className="py-3 px-4">{isBn ? 'মেয়াদ' : 'Duration'}</th>
              <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'State'}</th>
              <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programs.map((program) => (
              <tr key={program.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">
                    {isBn ? program.name_bn : program.name_en}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{program.code}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-800 font-medium">
                    {program.department
                      ? isBn
                        ? program.department.name_bn
                        : program.department.name_en
                      : '—'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {program.education_level
                      ? isBn
                        ? program.education_level.name_bn
                        : program.education_level.name_en
                      : '—'}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <SchemeBadge scheme={program.scheme} />
                </td>
                <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                  {program.duration_years} {isBn ? 'বছর' : 'Years'}
                </td>
                <td className="py-3.5 px-4">
                  <PeriodStatusChip state={program.state} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      to={`/app/academics/offerings?program_id=${program.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {isBn ? 'অফারিং' : 'Offerings'}
                    </Link>
                    {canManageStructure && (
                      <Link
                        to={`/app/academics/programs/${program.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-teal-700 hover:bg-teal-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isBn ? 'সম্পাদনা' : 'Edit'}
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
