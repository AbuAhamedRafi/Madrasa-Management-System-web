import React, { useState } from 'react';
import type { AcademicOffering } from '../../../../types/academics';
import { academicsApi } from '../../../../services/academicsApi';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Props {
  offering: AcademicOffering | null;
  onClose: () => void;
  onCreated: () => void;
}

export const AddSectionModal: React.FC<Props> = ({ offering, onClose, onCreated }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [code, setCode] = useState('SEC-A');
  const [nameBn, setNameBn] = useState('শাখা ক');
  const [nameEn, setNameEn] = useState('Section A');
  const [capacity, setCapacity] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offering) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await academicsApi.createSection(offering.id, {
        code,
        name_bn: nameBn,
        name_en: nameEn,
        capacity: Number(capacity),
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create section.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isBn ? 'নতুন শাখা (Section) যোগ করুন' : 'Add Offering Section'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
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
              {isBn ? 'শাখা কোড *' : 'Section Code *'}
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'শাখার নাম (বাংলা) *' : 'Section Name (Bangla) *'}
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
              {isBn ? 'শাখার নাম (ইংরেজি) *' : 'Section Name (English) *'}
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
              {isBn ? 'ধারণক্ষমতা (আসন সংখ্যা)' : 'Capacity'}
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {submitting ? '...' : isBn ? 'সংরক্ষণ করুন' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
