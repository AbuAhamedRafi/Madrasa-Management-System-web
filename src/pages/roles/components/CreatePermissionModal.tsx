import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, PlusCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    module: string;
    label_en: string;
    label_bn: string;
    description_en?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CreatePermissionModal: React.FC<Props> = ({ onClose, onSubmit, isSubmitting }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [key, setKey] = useState('');
  const [module, setModule] = useState('D01_Users');
  const [labelEn, setLabelEn] = useState('');
  const [labelBn, setLabelBn] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      key: key.toLowerCase().trim(),
      module,
      label_en: labelEn.trim(),
      label_bn: labelBn.trim(),
      description_en: desc.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <PlusCircle className="w-5 h-5 text-[#137C73]" />
            <span>{isBn ? 'নতুন পারমিশন ফ্ল্যাগ তৈরি' : 'Create Custom Permission Flag'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'পারমিশন কী (ইউনিক শনাক্তকারী) *' : 'Permission Key (e.g. library.books.issue) *'}
            </label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. library.books.issue"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'মডিউল কোড *' : 'Module Category *'}
            </label>
            <input
              type="text"
              required
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g. D10_Library"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (বাংলা) *' : 'Label (Bangla) *'}
              </label>
              <input
                type="text"
                required
                value={labelBn}
                onChange={(e) => setLabelBn(e.target.value)}
                placeholder="বই ইস্যু ও ফেরত"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (English) *' : 'Label (English) *'}
              </label>
              <input
                type="text"
                required
                value={labelEn}
                onChange={(e) => setLabelEn(e.target.value)}
                placeholder="Issue & return books"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Allows staff to check out and return library books."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#137C73] hover:bg-[#0f665e] text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : isBn ? 'পারমিশন তৈরি করুন' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
