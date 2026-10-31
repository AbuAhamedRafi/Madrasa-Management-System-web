import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { StudentProfile } from '../../../types/students';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const StudentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    date_of_birth: '',
    gender: 'MALE',
    admission_date: '',
    birth_registration_number: '',
    present_address_bn: '',
    present_address_en: '',
    permanent_address_bn: '',
    permanent_address_en: '',
  });

  const [student, setStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (!id) return;
    studentsApi
      .getStudent(Number(id))
      .then((data) => {
        setStudent(data);
        setFormData({
          name_bn: data.name_bn || '',
          name_en: data.name_en || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          gender: data.gender || 'MALE',
          admission_date: data.admission_date ? data.admission_date.split('T')[0] : '',
          birth_registration_number: data.birth_registration_number || '',
          present_address_bn: data.present_address_bn || '',
          present_address_en: data.present_address_en || '',
          permanent_address_bn: data.permanent_address_bn || '',
          permanent_address_en: data.permanent_address_en || '',
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || 'Failed to load student details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await studentsApi.updateStudent(Number(id), formData);
      navigate(`/app/students/${id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          (err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(' ')
            : 'Failed to update student profile.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        {isBn ? 'শিক্ষার্থীর তথ্য লোড হচ্ছে...' : 'Loading student information...'}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-rose-600">{error || 'Student not found.'}</p>
        <Link
          to="/app/students"
          className="mt-4 inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {isBn ? 'শিক্ষার্থী তালিকায় ফিরে যান' : 'Back to Students Directory'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/students/${id}`}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isBn ? 'শিক্ষার্থীর তথ্য সম্পাদনা' : 'Edit Student Profile'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {student.student_id} · {isBn ? student.name_bn : student.name_en}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'শিক্ষার্থীর প্রাথমিক ও পরিচিতি সংক্রান্ত তথ্য হালনাগাদ করুন।'
              : 'Update basic student details and contact addresses.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'শিক্ষার্থীর নাম (বাংলা) *' : 'Student Name (Bangla) *'}
            </label>
            <input
              type="text"
              required
              value={formData.name_bn}
              onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'Student Name (English) *' : 'Student Name (English) *'}
            </label>
            <input
              type="text"
              required
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'জন্ম তারিখ *' : 'Date of Birth *'}
            </label>
            <input
              type="date"
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'লিঙ্গ *' : 'Gender *'}
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="MALE">{isBn ? 'ছাত্র (পুরুষ)' : 'Male'}</option>
              <option value="FEMALE">{isBn ? 'ছাত্রী (মহিলা)' : 'Female'}</option>
              <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'ভর্তি তারিখ *' : 'Admission Date *'}
            </label>
            <input
              type="date"
              required
              value={formData.admission_date}
              onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'জন্ম নিবন্ধন সনদ নম্বর (BRC)' : 'Birth Registration Certificate (BRC)'}
            </label>
            <input
              type="text"
              placeholder="17 digits"
              value={formData.birth_registration_number}
              onChange={(e) => setFormData({ ...formData, birth_registration_number: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            {isBn ? 'ঠিকানা সংক্রান্ত তথ্য' : 'Address Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'বর্তমান ঠিকানা (বাংলা)' : 'Present Address (Bangla)'}
              </label>
              <textarea
                rows={2}
                value={formData.present_address_bn}
                onChange={(e) => setFormData({ ...formData, present_address_bn: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'বর্তমান ঠিকানা (ইংরেজি)' : 'Present Address (English)'}
              </label>
              <textarea
                rows={2}
                value={formData.present_address_en}
                onChange={(e) => setFormData({ ...formData, present_address_en: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'স্থায়ী ঠিকানা (বাংলা)' : 'Permanent Address (Bangla)'}
              </label>
              <textarea
                rows={2}
                value={formData.permanent_address_bn}
                onChange={(e) => setFormData({ ...formData, permanent_address_bn: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'স্থায়ী ঠিকানা (ইংরেজি)' : 'Permanent Address (English)'}
              </label>
              <textarea
                rows={2}
                value={formData.permanent_address_en}
                onChange={(e) => setFormData({ ...formData, permanent_address_en: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to={`/app/students/${id}`}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

