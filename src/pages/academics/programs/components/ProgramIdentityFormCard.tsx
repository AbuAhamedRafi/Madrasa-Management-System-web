import React from 'react';
import type { AcademicScheme, Department, EducationLevel, ProgramState } from '../../../../types/academics';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

interface Props {
  isEdit: boolean;
  hasDependencies: boolean;
  code: string;
  setCode: (val: string) => void;
  nameBn: string;
  setNameBn: (val: string) => void;
  nameEn: string;
  setNameEn: (val: string) => void;
  departmentId: number | '';
  setDepartmentId: (val: number) => void;
  levelId: number | '';
  setLevelId: (val: number) => void;
  scheme: AcademicScheme;
  setScheme: (val: AcademicScheme) => void;
  durationYears: number;
  setDurationYears: (val: number) => void;
  state: ProgramState;
  setState: (val: ProgramState) => void;
  departments: Department[];
  levels: EducationLevel[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProgramIdentityFormCard: React.FC<Props> = ({
  isEdit,
  hasDependencies,
  code,
  setCode,
  nameBn,
  setNameBn,
  nameEn,
  setNameEn,
  departmentId,
  setDepartmentId,
  levelId,
  setLevelId,
  scheme,
  setScheme,
  durationYears,
  setDurationYears,
  state,
  setState,
  departments,
  levels,
  submitting,
  onSubmit,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">
          {isBn ? 'প্রোগ্রাম পরিচিতি ও একাডেমিক স্কিম' : 'Program Identity & Academic Scheme'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'প্রোগ্রাম কোড, বিভাগ, বোর্ড স্তর এবং সেশন-ভিত্তিক বা বার্ষিক স্কিম নির্ধারণ করুন'
            : 'Configure program code, department, education level and academic scheme'}
        </p>
      </div>

      {hasDependencies && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            {isBn
              ? 'এই প্রোগ্রামের অধীনে সেশন বা শিক্ষাবর্ষ থাকায় এর একাডেমিক স্কিম লক করা হয়েছে।'
              : 'Academic scheme is locked because dependent cohorts or study periods exist.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রোগ্রাম কোড *' : 'Program Code *'}
          </label>
          <input
            type="text"
            required
            disabled={isEdit}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. PRG-FAZIL"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'একাডেমিক স্কিম *' : 'Academic Scheme *'}
          </label>
          <select
            value={scheme}
            disabled={hasDependencies}
            onChange={(e) => setScheme(e.target.value as AcademicScheme)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="CALENDAR_YEAR">
              {isBn ? 'বার্ষিক ক্লাস প্রোগ্রাম (CALENDAR_YEAR)' : 'Calendar Year Program (CALENDAR_YEAR)'}
            </option>
            <option value="SESSION_BASED">
              {isBn ? 'সেশন-ভিত্তিক প্রোগ্রাম (SESSION_BASED)' : 'Session-Based Cohort Program (SESSION_BASED)'}
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রোগ্রামের নাম (বাংলা) *' : 'Program Name (Bangla) *'}
          </label>
          <input
            type="text"
            required
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রোগ্রামের নাম (ইংরেজি) *' : 'Program Name (English) *'}
          </label>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'একাডেমিক বিভাগ *' : 'Department *'}
          </label>
          <select
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{isBn ? '-- বিভাগ নির্বাচন করুন --' : '-- Select Department --'}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {isBn ? d.name_bn : d.name_en} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'শিক্ষা বোর্ড স্তর (Level) *' : 'Education Level *'}
          </label>
          <select
            required
            value={levelId}
            onChange={(e) => setLevelId(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{isBn ? '-- স্তর নির্বাচন করুন --' : '-- Select Level --'}</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {isBn ? l.name_bn : l.name_en} ({l.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রোগ্রামের মেয়াদ (বছর) *' : 'Duration (Years) *'}
          </label>
          <input
            type="number"
            min={1}
            max={12}
            required
            value={durationYears}
            onChange={(e) => setDurationYears(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রোগ্রামের অবস্থা' : 'Program State'}
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as ProgramState)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ACTIVE">{isBn ? 'সক্রিয় (ACTIVE)' : 'ACTIVE'}</option>
            <option value="DRAFT">{isBn ? 'খসড়া (DRAFT)' : 'DRAFT'}</option>
            <option value="INACTIVE">{isBn ? 'নিষ্ক্রিয় (INACTIVE)' : 'INACTIVE'}</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50"
        >
          {submitting
            ? isBn
              ? 'সংরক্ষণ হচ্ছে...'
              : 'Saving...'
            : isEdit
            ? isBn
              ? 'পরিবর্তন সংরক্ষণ করুন'
              : 'Save Changes'
            : isBn
            ? 'প্রোগ্রাম তৈরি করুন'
            : 'Create Program'}
        </button>
      </div>
    </form>
  );
};
