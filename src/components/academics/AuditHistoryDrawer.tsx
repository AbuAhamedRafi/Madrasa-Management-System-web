import React from 'react';
import type { AuditHistoryItem } from '../../types/academics';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldCheck } from 'lucide-react';

interface Props {
  entries: AuditHistoryItem[];
}

export const AuditHistoryDrawer: React.FC<Props> = ({ entries }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  if (!entries || entries.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        {isBn ? 'কোনো অডিট ইতিহাস পাওয়া যায়নি।' : 'No audit history entries found.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-xs flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {entry.action_code}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {entry.created_at ? new Date(entry.created_at).toLocaleString(isBn ? 'bn-BD' : 'en-US') : '—'}
            </span>
          </div>
          <div className="text-xs text-slate-700">
            <span className="font-medium text-slate-900">
              {isBn ? 'সম্পাদনকারী:' : 'Actor:'}
            </span>{' '}
            {isBn ? entry.actor_name_bn : entry.actor_name}
          </div>
          {entry.reason && (
            <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
              <span className="font-medium text-slate-800">{isBn ? 'কারণ:' : 'Reason:'}</span>{' '}
              {entry.reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
