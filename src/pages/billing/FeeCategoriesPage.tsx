import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tag,
  Plus,
  Search,
  Archive,
  Edit2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { billingApi } from '../../services/billingApi';
import type { FeeBillingType, FeeCadence, FeeCategory } from '../../types/billing';

export const FeeCategoriesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [billingTypeFilter, setBillingTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<FeeCategory | null>(null);
  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [billingType, setBillingType] = useState<FeeBillingType>('ONE_TIME');
  const [defaultCadence, setDefaultCadence] = useState<FeeCadence>('ONCE');
  const [isMandatoryDefault, setIsMandatoryDefault] = useState(true);
  const [sortOrder, setSortOrder] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const list = await billingApi.listCategories({
        search: search || undefined,
        billing_type: billingTypeFilter || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter === 'active',
      });
      setCategories(list);
    } catch (err) {
      console.error('Failed to load fee categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [billingTypeFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingCat(null);
    setCode('');
    setNameBn('');
    setNameEn('');
    setBillingType('ONE_TIME');
    setDefaultCadence('ONCE');
    setIsMandatoryDefault(true);
    setSortOrder((categories.length + 1) * 10);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (cat: FeeCategory) => {
    setEditingCat(cat);
    setCode(cat.code);
    setNameBn(cat.name_bn);
    setNameEn(cat.name_en);
    setBillingType(cat.billing_type);
    setDefaultCadence(cat.default_cadence);
    setIsMandatoryDefault(cat.is_mandatory_default);
    setSortOrder(cat.sort_order);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (editingCat) {
        await billingApi.updateCategory(editingCat.id, {
          code,
          name_bn: nameBn,
          name_en: nameEn,
          billing_type: billingType,
          default_cadence: defaultCadence,
          is_mandatory_default: isMandatoryDefault,
          sort_order: sortOrder,
        });
      } else {
        await billingApi.createCategory({
          code,
          name_bn: nameBn,
          name_en: nameEn,
          billing_type: billingType,
          default_cadence: defaultCadence,
          is_mandatory_default: isMandatoryDefault,
          sort_order: sortOrder,
        });
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save fee category');
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (cat: FeeCategory) => {
    try {
      await billingApi.archiveCategory(cat.id);
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to archive category');
    }
  };

  const activeCount = categories.filter((c) => c.is_active).length;
  const mandatoryCount = categories.filter((c) => c.is_mandatory_default).length;
  const recurringCount = categories.filter((c) => c.billing_type === 'RECURRING').length;
  const archivedCount = categories.filter((c) => !c.is_active).length;

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
            <span>{isBn ? 'ফি খাতসমূহ' : 'Categories'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182C4B]">
            {isBn ? 'ফি খাত ও বিলিং নিয়ম' : 'Fee Categories & Billing Rules'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ভর্তি, মাসিক টিউশন, পরীক্ষা এবং বিবিধ ফি খাতের সংজ্ঞা ও নিয়ম কনফিগার করুন'
              : 'Configure admission, tuition, examination, and miscellaneous fee categories.'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#137C73] text-white hover:bg-[#0f655d] shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isBn ? 'নতুন খাত তৈরি করুন' : 'Create Category'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'সক্রিয় ফি খাত' : 'Active Fee Categories'}</span>
            <Tag className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{activeCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'সকল বিভাগের জন্য প্রযোজ্য' : 'Across all departments'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'ভর্তি বাধ্যতামূলক ডিফল্ট' : 'Mandatory Default'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{mandatoryCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'ভর্তি ছাড়পত্রের জন্য ব্যবহৃত' : 'Used for admission clearance rules'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'পুনরাবৃত্ত খাত' : 'Recurring Categories'}</span>
            <span className="text-teal-700 font-bold">↻</span>
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{recurringCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'মাসিক বা সাময়িক বিলিং' : 'Monthly & periodic scheduling'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isBn ? 'আর্কাইভকৃত খাত' : 'Archived Categories'}</span>
            <Archive className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#182C4B] mt-2">{archivedCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {isBn ? 'কখনো মুছে ফেলা হয় না' : 'Never hard-deleted'}
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCategories();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? 'কোড বা নাম খুঁজুন...' : 'Search categories...'}
                className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              {isBn ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={billingTypeFilter}
              onChange={(e) => setBillingTypeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
            >
              <option value="">{isBn ? 'সকল বিলিং ধরন' : 'All Billing Types'}</option>
              <option value="ONE_TIME">ONE_TIME</option>
              <option value="RECURRING">RECURRING</option>
              <option value="EVENT_BASED">EVENT_BASED</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
            >
              <option value="">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="active">{isBn ? 'সক্রিয়' : 'Active'}</option>
              <option value="archived">{isBn ? 'আর্কাইভকৃত' : 'Archived'}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">{isBn ? 'কোড' : 'Code'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'খাতের নাম (বাংলা / EN)' : 'Category Name'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'বিলিং ধরন' : 'Billing Type'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'ডিফল্ট ক্যাডেন্স' : 'Default Cadence'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'বাধ্যতামূলক ডিফল্ট' : 'Mandatory Gate'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3 px-4 font-semibold text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading fee categories...'}
                  </td>
                </tr>
              ) : !categories.length ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {isBn ? 'কোনো ফি খাত পাওয়া যায়নি' : 'No fee categories found'}
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{cat.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{cat.name_bn}</div>
                      <div className="text-slate-500">{cat.name_en}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{cat.billing_type}</td>
                    <td className="py-3 px-4 text-slate-700">{cat.default_cadence}</td>
                    <td className="py-3 px-4">
                      {cat.is_mandatory_default ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {isBn ? 'বাধ্যতামূলক' : 'Required'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          {isBn ? 'ঐচ্ছিক' : 'Optional'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {cat.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {isBn ? 'সক্রিয়' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          {isBn ? 'আর্কাইভকৃত' : 'Archived'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                      >
                        <Edit2 className="w-3 h-3" />
                        {isBn ? 'সম্পাদনা' : 'Edit'}
                      </button>
                      {cat.is_active && (
                        <button
                          onClick={() => handleArchive(cat)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium"
                        >
                          <Archive className="w-3 h-3" />
                          {isBn ? 'আর্কাইভ' : 'Archive'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-[#182C4B]">
              {editingCat
                ? isBn
                  ? 'ফি খাত সম্পাদনা'
                  : 'Edit Fee Category'
                : isBn
                ? 'নতুন ফি খাত তৈরি করুন'
                : 'Create Fee Category'}
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'খাত কোড (যেমন: ADM_FEE)' : 'Category Code (e.g. ADM_FEE)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'ক্রম (Sort Order)' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'নাম (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'বিলিং ধরন' : 'Billing Type'}
                  </label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as FeeBillingType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="ONE_TIME">ONE_TIME</option>
                    <option value="RECURRING">RECURRING</option>
                    <option value="EVENT_BASED">EVENT_BASED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isBn ? 'ডিফল্ট ক্যাডেন্স' : 'Default Cadence'}
                  </label>
                  <select
                    value={defaultCadence}
                    onChange={(e) => setDefaultCadence(e.target.value as FeeCadence)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="ONCE">ONCE</option>
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="TERM">TERM</option>
                    <option value="ANNUAL">ANNUAL</option>
                    <option value="AD_HOC">AD_HOC</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isMandatoryDefault}
                  onChange={(e) => setIsMandatoryDefault(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600"
                />
                <span>
                  {isBn
                    ? 'ডিফল্টভাবে বাধ্যতামূলক ফি হিসেবে চিহ্নিত করুন'
                    : 'Mark as mandatory fee by default'}
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#137C73] text-white hover:bg-[#0f655d] disabled:opacity-50"
                >
                  {submitting
                    ? isBn
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBn
                    ? 'সংরক্ষণ করুন'
                    : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
