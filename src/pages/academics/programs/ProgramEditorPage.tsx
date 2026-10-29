import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { academicsApi } from '../../../services/academicsApi';
import type {
  AcademicScheme,
  AcademicTrack,
  Department,
  EducationLevel,
  ProgramClass,
  ProgramState,
} from '../../../types/academics';
import { ProgramIdentityFormCard } from './components/ProgramIdentityFormCard';
import { ProgramClassesTracksPanel } from './components/ProgramClassesTracksPanel';
import { ProgramConfigSummaryCard } from './components/ProgramConfigSummaryCard';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export const ProgramEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [levelId, setLevelId] = useState<number | ''>('');
  const [scheme, setScheme] = useState<AcademicScheme>('CALENDAR_YEAR');
  const [durationYears, setDurationYears] = useState<number>(1);
  const [state, setState] = useState<ProgramState>('ACTIVE');
  const [hasDependencies, setHasDependencies] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [classes, setClasses] = useState<ProgramClass[]>([]);
  const [tracks, setTracks] = useState<AcademicTrack[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadStructure = async (programId: number) => {
    const s = await academicsApi.getProgramStructure(programId);
    setCode(s.code);
    setNameBn(s.name_bn);
    setNameEn(s.name_en);
    setDepartmentId(s.department_id);
    setLevelId(s.education_level_id);
    setScheme(s.scheme);
    setDurationYears(s.duration_years);
    setState(s.state);
    setHasDependencies(Boolean(s.has_dependencies));
    setClasses(s.classes ?? []);
    setTracks(s.tracks ?? []);
  };

  useEffect(() => {
    Promise.all([academicsApi.getDepartments(), academicsApi.getLevels()]).then(
      ([deptData, lvlData]) => {
        setDepartments(deptData);
        setLevels(lvlData);
      }
    );

    if (isEdit && id) {
      loadStructure(Number(id));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !levelId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      if (isEdit && id) {
        await academicsApi.updateProgram(Number(id), {
          name_bn: nameBn,
          name_en: nameEn,
          department_id: Number(departmentId),
          education_level_id: Number(levelId),
          scheme: hasDependencies ? undefined : scheme,
          duration_years: Number(durationYears),
        });
        await academicsApi.updateProgramStatus(Number(id), state, 'Updated from Program Editor');
        await loadStructure(Number(id));
        setSuccessMsg(
          isBn ? 'প্রোগ্রাম সফলভাবে হালনাগাদ হয়েছে।' : 'Program updated successfully.'
        );
      } else {
        const created = await academicsApi.createProgram({
          code,
          name_bn: nameBn,
          name_en: nameEn,
          department_id: Number(departmentId),
          education_level_id: Number(levelId),
          scheme,
          duration_years: Number(durationYears),
          state,
        });
        navigate(`/app/academics/programs/${created.id}/edit`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to save academic program.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/app/academics/structure"
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isBn ? 'শিক্ষা কাঠামো ট্রিতে ফিরে যান' : 'Back to Education Hierarchy'}
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit
              ? isBn
                ? 'প্রোগ্রাম ও স্কিম কনফিগারেশন সম্পাদনা'
                : 'Edit Program & Scheme Configuration'
              : isBn
              ? 'নতুন একাডেমিক প্রোগ্রাম তৈরি করুন'
              : 'Create New Academic Program'}
          </h1>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ProgramIdentityFormCard
            isEdit={isEdit}
            hasDependencies={hasDependencies}
            code={code}
            setCode={setCode}
            nameBn={nameBn}
            setNameBn={setNameBn}
            nameEn={nameEn}
            setNameEn={setNameEn}
            departmentId={departmentId}
            setDepartmentId={setDepartmentId}
            levelId={levelId}
            setLevelId={setLevelId}
            scheme={scheme}
            setScheme={setScheme}
            durationYears={durationYears}
            setDurationYears={setDurationYears}
            state={state}
            setState={setState}
            departments={departments}
            levels={levels}
            submitting={submitting}
            onSubmit={handleSubmit}
          />

          {isEdit && id && (
            <ProgramClassesTracksPanel
              programId={Number(id)}
              durationYears={durationYears}
              classes={classes}
              tracks={tracks}
              onReload={() => loadStructure(Number(id))}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <ProgramConfigSummaryCard
            scheme={scheme}
            durationYears={durationYears}
            classesCount={classes.length}
            tracksCount={tracks.length}
          />
        </div>
      </div>
    </div>
  );
};
