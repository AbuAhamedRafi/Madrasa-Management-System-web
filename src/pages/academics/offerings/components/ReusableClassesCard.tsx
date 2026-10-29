import React, { useState } from 'react';
import type { AcademicPeriod, AcademicTrack, ProgramClass } from '../../../../types/academics';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

interface Props {
  period: AcademicPeriod | null;
  classes: ProgramClass[];
  tracks: AcademicTrack[];
  canManageOfferings: boolean;
  onAddOffering: (classId: number, trackId: number | null) => Promise<void>;
}

export const ReusableClassesCard: React.FC<Props> = ({
  period,
  classes,
  tracks,
  canManageOfferings,
  onAddOffering,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedTrackId, setSelectedTrackId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const isClosed = period?.state === 'CLOSED';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    try {
      setSubmitting(true);
      await onAddOffering(
        Number(selectedClassId),
        selectedTrackId ? Number(selectedTrackId) : null
      );
      setSelectedClassId('');
      setSelectedTrackId('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {isBn ? 'ক্লাস অফারিং যুক্ত করুন' : 'Attach Class Offering to Period'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'নির্বাচিত শিক্ষাবর্ষের জন্য প্রোগ্রামের পুনর্ব্যবহারযোগ্য ক্লাস ও ট্র্যাক অফার করুন'
            : 'Offer a reusable program class (and optional track) inside the selected study period'}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-600">
          {isBn ? 'প্রোগ্রামের উপলব্ধ ক্লাসসমূহ:' : 'Available Program Classes:'}
        </div>
        {classes.map((c) => (
          <div
            key={c.id}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
          >
            <span className="font-medium text-slate-900">
              {isBn ? c.name_bn : c.name_en} ({c.code})
            </span>
            <span className="text-slate-500">
              {isBn ? `স্তর #${c.stage_number}` : `Stage #${c.stage_number}`}
            </span>
          </div>
        ))}
      </div>

      {canManageOfferings && period && !isClosed && (
        <form onSubmit={handleCreate} className="space-y-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'ক্লাস নির্বাচন করুন *' : 'Select Class *'}
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="">{isBn ? '-- ক্লাস নির্বাচন --' : '-- Choose Class --'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {isBn ? c.name_bn : c.name_en} (Stage #{c.stage_number})
                </option>
              ))}
            </select>
          </div>

          {tracks.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'গ্রুপ / ট্র্যাক (ঐচ্ছিক)' : 'Track / Stream (Optional)'}
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) =>
                  setSelectedTrackId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="">{isBn ? 'সাধারণ / ট্র্যাক ছাড়া' : 'General / No Track'}</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isBn ? t.name_bn : t.name_en}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'এই শিক্ষাবর্ষে অফারিং যোগ করুন' : 'Add Offering to Period'}
          </button>
        </form>
      )}
    </div>
  );
};
