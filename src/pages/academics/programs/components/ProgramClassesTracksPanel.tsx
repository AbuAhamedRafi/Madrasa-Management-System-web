import React, { useState } from 'react';
import type { AcademicTrack, ProgramClass } from '../../../../types/academics';
import { academicsApi } from '../../../../services/academicsApi';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

interface Props {
  programId: number;
  durationYears: number;
  classes: ProgramClass[];
  tracks: AcademicTrack[];
  onReload: () => void;
}

export const ProgramClassesTracksPanel: React.FC<Props> = ({
  programId,
  durationYears,
  classes,
  tracks,
  onReload,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [clsCode, setClsCode] = useState('');
  const [clsNameBn, setClsNameBn] = useState('');
  const [clsNameEn, setClsNameEn] = useState('');
  const [stageNumber, setStageNumber] = useState(1);

  const [trkCode, setTrkCode] = useState('');
  const [trkNameBn, setTrkNameBn] = useState('');
  const [trkNameEn, setTrkNameEn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await academicsApi.createClass({
        program_id: programId,
        code: clsCode,
        name_bn: clsNameBn,
        name_en: clsNameEn,
        stage_number: Number(stageNumber),
        sort_order: Number(stageNumber) * 10,
      });
      setClsCode('');
      setClsNameBn('');
      setClsNameEn('');
      onReload();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add class.');
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await academicsApi.createTrack({
        program_id: programId,
        code: trkCode,
        name_bn: trkNameBn,
        name_en: trkNameEn,
      });
      setTrkCode('');
      setTrkNameBn('');
      setTrkNameEn('');
      onReload();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add track.');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isBn ? 'প্রোগ্রামের ক্লাস / জামাত (Stages)' : 'Reusable Program Classes (Stages)'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? `স্তর নম্বর অবশ্যই ১ থেকে ${durationYears} এর মধ্যে হতে হবে`
              : `Stage number must be between 1 and ${durationYears}`}
          </p>
        </div>

        <div className="space-y-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900">
                  {isBn ? c.name_bn : c.name_en}
                </span>{' '}
                <span className="font-mono text-slate-500">({c.code})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700">
                {isBn ? `স্তর #${c.stage_number}` : `Stage #${c.stage_number}`}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            required
            placeholder="Code (CLS-...)"
            value={clsCode}
            onChange={(e) => setClsCode(e.target.value.toUpperCase())}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
          />
          <input
            type="text"
            required
            placeholder={isBn ? 'নাম (বাংলা)' : 'Name (BN)'}
            value={clsNameBn}
            onChange={(e) => setClsNameBn(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
          />
          <input
            type="text"
            required
            placeholder={isBn ? 'নাম (ইংরেজি)' : 'Name (EN)'}
            value={clsNameEn}
            onChange={(e) => setClsNameEn(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
          />
          <input
            type="number"
            min={1}
            max={durationYears}
            required
            value={stageNumber}
            onChange={(e) => setStageNumber(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-700 text-white px-3 py-1.5 text-xs font-medium hover:bg-teal-800"
          >
            <Plus className="w-3.5 h-3.5" />
            {isBn ? 'ক্লাস যোগ' : 'Add Class'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isBn ? 'একাডেমিক গ্রুপ / ট্র্যাক (বিজ্ঞান, সাধারণ ইত্যাদি)' : 'Academic Tracks / Groups'}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {tracks.map((t) => (
            <span
              key={t.id}
              className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium"
            >
              {isBn ? t.name_bn : t.name_en} ({t.code})
            </span>
          ))}
        </div>

        <form onSubmit={handleAddTrack} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            required
            placeholder="Code (TRK-...)"
            value={trkCode}
            onChange={(e) => setTrkCode(e.target.value.toUpperCase())}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
          />
          <input
            type="text"
            required
            placeholder={isBn ? 'নাম (বাংলা)' : 'Name (BN)'}
            value={trkNameBn}
            onChange={(e) => setTrkNameBn(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
          />
          <input
            type="text"
            required
            placeholder={isBn ? 'নাম (ইংরেজি)' : 'Name (EN)'}
            value={trkNameEn}
            onChange={(e) => setTrkNameEn(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-700 text-white px-3 py-1.5 text-xs font-medium hover:bg-teal-800"
          >
            <Plus className="w-3.5 h-3.5" />
            {isBn ? 'ট্র্যাক যোগ' : 'Add Track'}
          </button>
        </form>
      </div>
    </div>
  );
};
