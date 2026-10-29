import React, { useState } from 'react';
import { academicsApi } from '../../../../services/academicsApi';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateDepartmentModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [sortOrder, setSortOrder] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await academicsApi.createDepartment({
        code,
        name_bn: nameBn,
        name_en: nameEn,
        sort_order: Number(sortOrder),
      });
      setCode('');
      setNameBn('');
      setNameEn('');
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isBn ? 'নতুন একাডেমিক বিভাগ তৈরি করুন' : 'Create Academic Department'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'বিভাগ কোড (Code) *' : 'Department Code *'}
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. DEPT-HADITH"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'বিভাগের নাম (বাংলা) *' : 'Department Name (Bangla) *'}
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
              {isBn ? 'বিভাগের নাম (ইংরেজি) *' : 'Department Name (English) *'}
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
              {isBn ? 'ক্রম (Sort Order)' : 'Sort Order'}
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {submitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'সংরক্ষণ করুন' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
