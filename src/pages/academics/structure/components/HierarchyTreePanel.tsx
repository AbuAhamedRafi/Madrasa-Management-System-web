import React from 'react';
import type { HierarchyAuthorityNode } from '../../../../types/academics';
import { SchemeBadge } from '../../../../components/academics/SchemeBadge';
import { PeriodStatusChip } from '../../../../components/academics/PeriodStatusChip';
import { useTranslation } from 'react-i18next';
import { ChevronRight, GraduationCap, Shield } from 'lucide-react';

interface Props {
  authorities: HierarchyAuthorityNode[];
  selectedProgramId: number | null;
  onSelectProgram: (programId: number) => void;
}

export const HierarchyTreePanel: React.FC<Props> = ({
  authorities,
  selectedProgramId,
  onSelectProgram,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          {isBn ? 'শিক্ষা বোর্ড → স্তর → বিভাগ → প্রোগ্রাম ট্রি' : 'Authority → Level → Department → Program Tree'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'আলিয়া, কওমি ও অভ্যন্তরীণ শিক্ষা ধারার পূর্ণাঙ্গ কাঠামো'
            : 'Complete hierarchy across Alia, Qawmi & internal madrasa streams'}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {authorities.map((auth) => (
          <div key={auth.id} className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700" />
                <span className="font-semibold text-slate-900 text-sm">
                  {isBn ? auth.name_bn : auth.name_en}
                </span>
                <span className="text-xs font-mono text-slate-500">({auth.code})</span>
              </div>
              <span className="text-xs text-slate-500">
                {auth.levels.length} {isBn ? 'স্তর' : 'Levels'}
              </span>
            </div>

            <div className="p-3 space-y-3 bg-white">
              {auth.levels.map((lvl) => {
                const allPrograms = lvl.departments.flatMap((d) =>
                  d.programs.map((p) => ({ ...p, deptNameBn: d.name_bn, deptNameEn: d.name_en }))
                );
                return (
                  <div key={lvl.id} className="pl-3 border-l-2 border-teal-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-700">
                        {isBn ? lvl.name_bn : lvl.name_en}{' '}
                        <span className="font-mono text-slate-400">({lvl.code})</span>
                      </div>
                    </div>

                    {allPrograms.length === 0 ? (
                      <div className="text-xs text-slate-400 pl-2">
                        {isBn ? 'কোনো প্রোগ্রাম যুক্ত নেই' : 'No programs mapped'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 pl-2">
                        {allPrograms.map((prog) => {
                          const isSelected = selectedProgramId === prog.id;
                          return (
                            <button
                              key={prog.id}
                              type="button"
                              onClick={() => onSelectProgram(prog.id)}
                              className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                                  <span className="text-sm font-semibold text-slate-900">
                                    {isBn ? prog.name_bn : prog.name_en}
                                  </span>
                                  <SchemeBadge scheme={prog.scheme} />
                                  <PeriodStatusChip state={prog.state} />
                                </div>
                                <div className="text-xs text-slate-500">
                                  {isBn ? 'বিভাগ:' : 'Dept:'}{' '}
                                  {isBn ? prog.deptNameBn : prog.deptNameEn} •{' '}
                                  {isBn ? 'মেয়াদ:' : 'Duration:'} {prog.duration_years}{' '}
                                  {isBn ? 'বছর' : 'yrs'}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
