import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { StudentProfile, Guardian, GuardianRelation } from '../../../types/students';
import {
  ArrowLeft,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  X,
  Phone,
  Briefcase,
  MapPin,
} from 'lucide-react';

export const GuardianManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name_bn: '',
    name_en: '',
    phone: '',
    alternative_phone: '',
    relation: 'MOTHER' as GuardianRelation,
    sms_consent: false,
    consent_source: 'OFFICE_VISIT',
    occupation: '',
    address_bn: '',
  });

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const studentData = await studentsApi.getStudent(Number(id));
      setStudent(studentData);
      const guardiansData = await studentsApi.getGuardians(Number(id));
      setGuardians(guardiansData);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load guardians.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMakePrimary = async (guardianId: number) => {
    if (!id) return;
    try {
      setError(null);
      await studentsApi.makePrimaryGuardian(Number(id), guardianId);
      setSuccessMsg(isBn ? 'প্রধান অভিভাবক সফলভাবে পরিবর্তন করা হয়েছে।' : 'Primary guardian updated successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update primary guardian.');
    }
  };

  const handleToggleConsent = async (guardianId: number, currentConsent: boolean) => {
    if (!id) return;
    try {
      setError(null);
      await studentsApi.updateGuardianConsent(Number(id), guardianId, {
        sms_consent: !currentConsent,
        consent_source: 'MANUAL_OVERRIDE',
      });
      setSuccessMsg(isBn ? 'এসএমএস সম্মতি সফলভাবে হালনাগাদ করা হয়েছে।' : 'SMS consent updated successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update SMS consent.');
    }
  };

  const handleUnlink = async (guardianId: number, isPrimary: boolean) => {
    if (isPrimary) {
      setError(isBn ? 'প্রধান অভিভাবককে মুছে ফেলা যাবে না। প্রথমে অন্য কাউকে প্রধান অভিভাবক নির্ধারণ করুন।' : 'Cannot unlink primary guardian. Designate another guardian as primary first.');
      return;
    }
    if (!id) return;
    const confirmed = window.confirm(
      isBn ? 'আপনি কি নিশ্চিতভাবে এই অভিভাবককে বিচ্ছিন্ন করতে চান?' : 'Are you sure you want to unlink this guardian?'
    );
    if (!confirmed) return;

    try {
      setError(null);
      await studentsApi.unlinkGuardian(Number(id), guardianId);
      setSuccessMsg(isBn ? 'অভিভাবক বিচ্ছিন্ন করা হয়েছে।' : 'Guardian unlinked successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to unlink guardian.');
    }
  };

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await studentsApi.addGuardian(Number(id), addForm);
      setIsAddModalOpen(false);
      setAddForm({
        name_bn: '',
        name_en: '',
        phone: '',
        alternative_phone: '',
        relation: 'MOTHER',
        sms_consent: false,
        consent_source: 'OFFICE_VISIT',
        occupation: '',
        address_bn: '',
      });
      setSuccessMsg(isBn ? 'নতুন অভিভাবক সফলভাবে সংযুক্ত করা হয়েছে।' : 'New guardian linked successfully.');
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          (err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(' ')
            : 'Failed to add guardian.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        {isBn ? 'অভিভাবকদের তথ্য লোড হচ্ছে...' : 'Loading guardians...'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/students/${id}`}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isBn ? 'অভিভাবক ব্যবস্থাপনা' : 'Guardian Management'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {student?.student_id} · {isBn ? student?.name_bn : student?.name_en}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isBn ? '+ নতুন অভিভাবক যোগ করুন' : '+ Add Guardian'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Guardians List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {guardians.map((g) => {
          const isPrimary = g.is_primary;
          return (
            <div
              key={g.id}
              className={`rounded-xl border p-5 space-y-4 transition-all ${
                isPrimary
                  ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">
                      {isBn ? g.name_bn : g.name_en}
                    </span>
                    {isPrimary ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                        <UserCheck className="w-3.5 h-3.5" />
                        {isBn ? 'প্রধান অভিভাবক' : 'Primary'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {isBn ? 'সহকারী অভিভাবক' : 'Secondary'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {isBn ? g.name_en : g.name_bn} ·{' '}
                    <span className="font-semibold text-slate-700">{g.relation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isPrimary && (
                    <button
                      title={isBn ? 'প্রধান অভিভাবক করুন' : 'Make Primary Guardian'}
                      onClick={() => handleMakePrimary(g.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-teal-200 bg-white text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      {isBn ? 'প্রধান করুন' : 'Make Primary'}
                    </button>
                  )}
                  <button
                    disabled={isPrimary}
                    title={
                      isPrimary
                        ? isBn
                          ? 'প্রধান অভিভাবক বিচ্ছিন্ন করা যাবে না'
                          : 'Cannot unlink primary guardian'
                        : isBn
                        ? 'অভিভাবক বিচ্ছিন্ন করুন'
                        : 'Unlink Guardian'
                    }
                    onClick={() => handleUnlink(g.id, !!isPrimary)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isPrimary
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{g.phone || '—'}</span>
                  {g.alternative_phone && (
                    <span className="text-slate-400 font-mono">/ {g.alternative_phone}</span>
                  )}
                </div>
                {g.occupation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{g.occupation}</span>
                  </div>
                )}
                {g.address_bn && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{g.address_bn}</span>
                  </div>
                )}
              </div>

              {/* SMS Consent Switch */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700 font-medium">
                    {isBn ? 'এসএমএস বিজ্ঞপ্তি' : 'SMS Notifications'}:
                  </span>
                  <span
                    className={`font-semibold ${
                      g.sms_consent ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {g.sms_consent
                      ? isBn
                        ? 'সম্মতি আছে'
                        : 'Consented'
                      : isBn
                      ? 'সম্মতি নেই'
                      : 'No Consent'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleConsent(g.id, !!g.sms_consent)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    g.sms_consent ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      g.sms_consent ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Guardian Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? 'নতুন অভিভাবক সংযুক্ত করুন' : 'Link New Guardian'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuardian} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'অভিভাবকের নাম (বাংলা) *' : 'Guardian Name (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name_bn}
                    onChange={(e) => setAddForm({ ...addForm, name_bn: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'Guardian Name (English) *' : 'Guardian Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name_en}
                    onChange={(e) => setAddForm({ ...addForm, name_en: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'সম্পর্ক *' : 'Relation *'}
                  </label>
                  <select
                    value={addForm.relation}
                    onChange={(e) =>
                      setAddForm({ ...addForm, relation: e.target.value as GuardianRelation })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MOTHER">{isBn ? 'মাতা (Mother)' : 'Mother'}</option>
                    <option value="FATHER">{isBn ? 'পিতা (Father)' : 'Father'}</option>
                    <option value="BROTHER">{isBn ? 'ভাই (Brother)' : 'Brother'}</option>
                    <option value="SISTER">{isBn ? 'বোন (Sister)' : 'Sister'}</option>
                    <option value="PATERNAL_UNCLE">{isBn ? 'চাচা (Uncle)' : 'Paternal Uncle'}</option>
                    <option value="MATERNAL_UNCLE">{isBn ? 'মামা (Maternal Uncle)' : 'Maternal Uncle'}</option>
                    <option value="GRANDFATHER">{isBn ? 'দাদা/নানা (Grandfather)' : 'Grandfather'}</option>
                    <option value="GRANDMOTHER">{isBn ? 'দাদি/নানি (Grandmother)' : 'Grandmother'}</option>
                    <option value="LEGAL_GUARDIAN">{isBn ? 'আইনগত অভিভাবক' : 'Legal Guardian'}</option>
                    <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিকল্প মোবাইল (ঐচ্ছিক)' : 'Alternative Phone (Optional)'}
                  </label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={addForm.alternative_phone}
                    onChange={(e) => setAddForm({ ...addForm, alternative_phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পেশা' : 'Occupation'}
                  </label>
                  <input
                    type="text"
                    value={addForm.occupation}
                    onChange={(e) => setAddForm({ ...addForm, occupation: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'অভিভাবকের ঠিকানা' : 'Address'}
                </label>
                <textarea
                  rows={2}
                  value={addForm.address_bn}
                  onChange={(e) => setAddForm({ ...addForm, address_bn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add_sms_consent"
                  checked={addForm.sms_consent}
                  onChange={(e) => setAddForm({ ...addForm, sms_consent: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="add_sms_consent" className="text-xs text-slate-700">
                  {isBn
                    ? 'অভিভাবক এসএমএস বিজ্ঞপ্তির জন্য সম্মতি দিয়েছেন'
                    : 'Guardian consented to receive SMS notifications'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'যুক্ত করুন' : 'Add Guardian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
