import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Archive,
  Save,
  Send,
  AlertCircle,
  Info,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import { academicsApi } from '../../services/academicsApi';
import type { FeeCadence, FeeCategory, FeeStructure, FeeStructureItem } from '../../types/billing';

export const FeeStructureEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [structure, setStructure] = useState<FeeStructure | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  const [programId, setProgramId] = useState<number>(0);
  const [periodId, setPeriodId] = useState<number>(0);
  const [classId, setClassId] = useState<number>(0);
  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-01-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-12-31');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<FeeStructureItem[]>([]);

  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [progs, cats] = await Promise.all([
          academicsApi.getPrograms({ active: true }),
          billingApi.listCategories({ is_active: true }),
        ]);
        setPrograms(progs);
        setCategories(cats);

        if (id) {
          const existing = await billingApi.getStructure(Number(id));
          setStructure(existing);
          setProgramId(existing.program_id);
          setPeriodId(existing.academic_period_id);
          setClassId(existing.program_class_id);
          setCode(existing.code);
          setNameBn(existing.name_bn);
          setNameEn(existing.name_en);
          setEffectiveFrom(existing.effective_from?.slice(0, 10) || '2026-01-01');
          setEffectiveTo(existing.effective_to?.slice(0, 10) || '');
          setNotes(existing.notes || '');
          setItems(existing.items || []);
        } else if (progs.length > 0) {
          setProgramId(progs[0].id);
          if (cats.length > 0) {
            setItems([
              {
                fee_category_id: cats[0].id,
                amount: '1200.00',
                cadence: cats[0].default_cadence,
                is_mandatory: true,
                applies_on_admission: true,
                applies_on_promotion: false,
                applies_monthly: cats[0].default_cadence === 'MONTHLY',
                due_day_of_month: 15,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to initialize FeeStructureEditorPage', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!programId) return;
    const loadProgramScope = async () => {
      try {
        const [pds, cls] = await Promise.all([
          academicsApi.getPeriods({ program_id: programId }),
          academicsApi.getClasses(programId, true),
        ]);
        setPeriods(pds);
        setClasses(cls);
        if (!id) {
          if (pds.length > 0) setPeriodId(pds[0].id);
          if (cls.length > 0) setClassId(cls[0].id);
        }
      } catch (err) {
        console.error('Failed to load periods/classes', err);
      }
    };
    loadProgramScope();
  }, [programId, id]);

  const isReadOnly = structure !== null && structure.status !== 'DRAFT';

  const handleAddItem = () => {
    if (categories.length === 0) return;
    const defaultCat = categories[0];
    setItems([
      ...items,
      {
        fee_category_id: defaultCat.id,
        amount: '500.00',
        cadence: defaultCat.default_cadence,
        is_mandatory: defaultCat.is_mandatory_default,
        applies_on_admission: defaultCat.billing_type === 'ONE_TIME',
        applies_on_promotion: false,
        applies_monthly: defaultCat.default_cadence === 'MONTHLY',
        due_day_of_month: 15,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, patch: Partial<FeeStructureItem>) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const admissionTotal = items
    .filter((i) => i.applies_on_admission)
    .reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0)
    .toFixed(2);

  const monthlyTotal = items
    .filter((i) => i.applies_monthly || i.cadence === 'MONTHLY')
    .reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0)
    .toFixed(2);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      if (structure) {
        const updated = await billingApi.updateStructure(structure.id, {
          lock_version: structure.lock_version,
          name_bn: nameBn,
          name_en: nameEn,
          effective_from: effectiveFrom,
          effective_to: effectiveTo || null,
          notes: notes || null,
          items: items.map((it, idx) => ({
            fee_category_id: Number(it.fee_category_id),
            amount: it.amount,
            cadence: it.cadence,
            is_mandatory: it.is_mandatory,
            applies_on_admission: it.applies_on_admission,
            applies_on_promotion: it.applies_on_promotion,
            applies_monthly: it.applies_monthly,
            due_day_of_month: it.due_day_of_month || 15,
            sort_order: (idx + 1) * 10,
          })),
        });
        setStructure(updated);
        setItems(updated.items || []);
        setSuccessMsg(isBn ? 'খসড়া সফলভাবে সংরক্ষিত হয়েছে' : 'Draft saved successfully');
      } else {
        const created = await billingApi.createStructure({
          code,
          name_bn: nameBn,
          name_en: nameEn,
          program_id: Number(programId),
          academic_period_id: Number(periodId),
          program_class_id: Number(classId),
          effective_from: effectiveFrom,
          effective_to: effectiveTo || null,
          notes: notes || null,
          items: items.map((it, idx) => ({
            fee_category_id: Number(it.fee_category_id),
            amount: it.amount,
            cadence: it.cadence,
            is_mandatory: it.is_mandatory,
            applies_on_admission: it.applies_on_admission,
            applies_on_promotion: it.applies_on_promotion,
            applies_monthly: it.applies_monthly,
            due_day_of_month: it.due_day_of_month || 15,
            sort_order: (idx + 1) * 10,
          })),
        });
        navigate(`/app/billing/fee-structures/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          (isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save fee structure')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!structure) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const published = await billingApi.publishStructure(structure.id, structure.lock_version);
      setStructure(published);
      setSuccessMsg(isBn ? 'ফি কাঠামো প্রকাশিত হয়েছে!' : 'Fee structure published!');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          (isBn ? 'প্রকাশ করা যায়নি' : 'Failed to publish fee structure')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloneVersion = async () => {
    if (!structure) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const cloned = await billingApi.cloneStructure(structure.id);
      navigate(`/app/billing/fee-structures/${cloned.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to clone version');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!structure) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const archived = await billingApi.archiveStructure(structure.id, structure.lock_version);
      setStructure(archived);
      setSuccessMsg(isBn ? 'ফি কাঠামো আর্কাইভ করা হয়েছে' : 'Fee structure archived');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to archive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Link to="/app/billing" className="hover:underline flex items-center gap-1 text-teal-700">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? 'বিলিং ড্যাশবোর্ড' : 'Billing'}
            </Link>
            <span>/</span>
            <span>{isBn ? 'ফি কাঠামো' : 'Fee Structures'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {structure
              ? `${isBn ? structure.name_bn : structure.name_en} (v${structure.version_no})`
              : isBn
              ? 'ফি কাঠামো তৈরি / সম্পাদনা'
              : 'Create / Edit Fee Structure'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'প্রোগ্রাম, শিক্ষাবর্ষ, ফি খাত ও ভর্তির বাধ্যতামূলক চার্জ নির্ধারণ'
              : 'Define academic scope, fee items, cadences, and mandatory admission rules'}
          </p>
        </div>

        {structure && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                structure.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : structure.status === 'DRAFT'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {structure.status} · v{structure.version_no}
            </span>
            {structure.status === 'PUBLISHED' && (
              <>
                <button
                  onClick={handleCloneVersion}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isBn ? 'নতুন সংস্করণ ক্লোন করুন' : 'Clone Version'}
                </button>
                <button
                  onClick={handleArchive}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {isBn ? 'আর্কাইভ করুন' : 'Archive'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-teal-50 text-teal-800 font-bold text-xs py-2.5 px-4 rounded-lg text-center border border-teal-200">
          {isBn ? '১. শিক্ষাক্রম নির্বাচন' : '1. Academic Scope Selection'}
        </div>
        <div className="bg-teal-50 text-teal-800 font-bold text-xs py-2.5 px-4 rounded-lg text-center border border-teal-200">
          {isBn ? '২. ফি উপাদান নির্ধারণ' : '2. Fee Line Items & Amounts'}
        </div>
        <div
          className={`font-bold text-xs py-2.5 px-4 rounded-lg text-center border ${
            structure?.status === 'PUBLISHED'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isBn ? '৩. যাচাই ও প্রকাশ' : '3. Validate & Publish'}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Metadata */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#182C4B]">
            {isBn ? 'ফি কাঠামোর বিবরণ' : 'Fee Structure Scope'}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {isBn ? 'কাঠামো কোড (Code)' : 'Structure Code'}
            </label>
            <input
              type="text"
              required
              disabled={!!structure}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FS-DAKHIL-C7-2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'নাম (বাংলা)' : 'Structure Name (Bangla)'}
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="দাখিল ৭ম শ্রেণি — ২০২৬ ফি কাঠামো"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'নাম (English)' : 'Structure Name (English)'}
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Dakhil Class 7 — 2026 Standard"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {isBn ? 'প্রোগ্রাম (D02)' : 'Academic Program'}
            </label>
            <select
              disabled={!!structure}
              value={programId}
              onChange={(e) => setProgramId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white disabled:bg-slate-100"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {isBn ? p.name_bn : p.name_en} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'শিক্ষাবর্ষ / পিরিয়ড' : 'Academic Period'}
              </label>
              <select
                disabled={!!structure}
                value={periodId}
                onChange={(e) => setPeriodId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white disabled:bg-slate-100"
              >
                {periods.map((pd) => (
                  <option key={pd.id} value={pd.id}>
                    {pd.name_en || pd.label || pd.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'শ্রেণি / স্টেজ' : 'Class / Stage'}
              </label>
              <select
                disabled={!!structure}
                value={classId}
                onChange={(e) => setClassId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white disabled:bg-slate-100"
              >
                {classes.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {isBn ? cl.name_bn : cl.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'কার্যকর শুরুর তারিখ' : 'Effective From'}
              </label>
              <input
                type="date"
                required
                disabled={isReadOnly}
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {isBn ? 'কার্যকর শেষ তারিখ' : 'Effective To'}
              </label>
              <input
                type="date"
                disabled={isReadOnly}
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-sky-900 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              {isBn
                ? 'একই স্কোপ এবং কার্যকর সময়সীমায় দুটি প্রকাশিত কাঠামো সংঘর্ষ করতে পারবে না। প্রকাশিত কাঠামো অপরিবর্তনীয়।'
                : 'Two published structures cannot overlap in the same academic scope and effective date window. Published structures are immutable.'}
            </span>
          </div>
        </section>

        {/* Right 2 Columns: Line Items & Totals */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#182C4B]">
                {isBn ? 'ফি উপাদান ও যোগফল' : 'Fee Components & Summary'}
              </h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isBn ? 'খাত যোগ করুন' : 'Add Fee Line'}
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">{isBn ? 'খাত' : 'Fee Category'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isBn ? 'পরিমাণ (৳)' : 'Amount (BDT)'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isBn ? 'ক্যাডেন্স' : 'Cadence'}</th>
                    <th className="py-2.5 px-3 font-semibold text-center">
                      {isBn ? 'ভর্তিতে প্রযোজ্য' : 'On Admission'}
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-center">
                      {isBn ? 'প্রমোশনে প্রযোজ্য' : 'On Promotion'}
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-center">
                      {isBn ? 'মাসিক ধার্য' : 'Monthly'}
                    </th>
                    {!isReadOnly && <th className="py-2.5 px-3 text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <select
                          disabled={isReadOnly}
                          value={item.fee_category_id}
                          onChange={(e) =>
                            handleUpdateItem(idx, { fee_category_id: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {isBn ? c.name_bn : c.name_en} ({c.code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          disabled={isReadOnly}
                          value={item.amount}
                          onChange={(e) => handleUpdateItem(idx, { amount: e.target.value })}
                          className="w-28 px-2 py-1.5 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          disabled={isReadOnly}
                          value={item.cadence}
                          onChange={(e) =>
                            handleUpdateItem(idx, {
                              cadence: e.target.value as FeeCadence,
                              applies_monthly: e.target.value === 'MONTHLY',
                            })
                          }
                          className="px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="ONCE">ONCE</option>
                          <option value="MONTHLY">MONTHLY</option>
                          <option value="TERM">TERM</option>
                          <option value="ANNUAL">ANNUAL</option>
                          <option value="AD_HOC">AD_HOC</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={item.applies_on_admission}
                          onChange={(e) =>
                            handleUpdateItem(idx, { applies_on_admission: e.target.checked })
                          }
                          className="rounded border-slate-300 text-teal-600"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={item.applies_on_promotion}
                          onChange={(e) =>
                            handleUpdateItem(idx, { applies_on_promotion: e.target.checked })
                          }
                          className="rounded border-slate-300 text-teal-600"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={item.applies_monthly}
                          onChange={(e) =>
                            handleUpdateItem(idx, { applies_monthly: e.target.checked })
                          }
                          className="rounded border-slate-300 text-teal-600"
                        />
                      </td>
                      {!isReadOnly && (
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">
                  {isBn ? 'প্রথম ভর্তি বাধ্যতামূলক যোগফল:' : 'First Admission Total:'}
                </span>
                <strong className="text-[#182C4B] text-base font-extrabold">
                  ৳ {admissionTotal}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">
                  {isBn ? 'মাসিক টিউশন ধার্য:' : 'Monthly Recurring Total:'}
                </span>
                <strong className="text-teal-700 text-base font-extrabold">
                  ৳ {monthlyTotal}
                </strong>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Save className="w-4 h-4" />
                  {isBn ? 'খসড়া সংরক্ষণ করুন' : 'Save Draft'}
                </button>

                {structure && structure.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {isBn ? 'প্রকাশ করুন (Publish)' : 'Publish Structure'}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </form>
    </div>
  );
};
