import React from 'react';
import { AcademicOffering } from '../../../../types/academics';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';

interface Props {
  offerings: AcademicOffering[];
  isPeriodClosed: boolean;
  canManageOfferings: boolean;
  onOpenAddSection: (offering: AcademicOffering) => void;
}

export const OfferingsSectionsTableCard: React.FC<Props> = ({
  offerings,
  isPeriodClosed,
  canManageOfferings,
  onOpenAddSection,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900">
          {isBn ? 'অফারকৃত ক্লাস ও শাখা (Sections) তালিকা' : 'Offered Classes & Sections'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'নির্বাচিত শিক্ষাবর্ষের অধীনে চলমান ক্লাস অফারিং এবং শাখা ও আসন সংখ্যা'
            : 'Period-scoped class offerings and section capacities'}
        </p>
      </div>

      {offerings.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          {isBn
            ? 'এই শিক্ষাবর্ষে এখনো কোনো ক্লাস অফারিং যুক্ত করা হয়নি।'
            : 'No class offerings attached to this study period yet.'}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {offerings.map((off) => (
            <div key={off.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    {off.program_class
                      ? isBn
                        ? off.program_class.name_bn
                        : off.program_class.name_en
                      : `#${off.program_class_id}`}
                  </span>
                  {off.program_class && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {isBn
                        ? `স্তর #${off.program_class.stage_number}`
                        : `Stage #${off.program_class.stage_number}`}
                    </span>
                  )}
                  {off.track && (
                    <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                      {isBn ? off.track.name_bn : off.track.name_en}
                    </span>
                  )}
                </div>

                {canManageOfferings && !isPeriodClosed && (
                  <button
                    type="button"
                    onClick={() => onOpenAddSection(off)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium hover:bg-teal-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isBn ? 'নতুন শাখা (Section)' : 'Add Section'}
                  </button>
                )}
              </div>

              {off.sections.length === 0 ? (
                <div className="text-xs text-slate-400 pl-2">
                  {isBn ? 'কোনো শাখা নেই' : 'No sections created yet'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {off.sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {isBn ? sec.name_bn : sec.name_en}
                        </div>
                        <div className="font-mono text-slate-500">{sec.code}</div>
                      </div>
                      <div className="inline-flex items-center gap-1 text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                        <Users className="w-3 h-3 text-teal-700" />
                        <span>{sec.capacity ?? '∞'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
