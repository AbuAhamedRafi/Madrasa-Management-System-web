import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermissionFlagsSelector } from '../../../components/permissions/PermissionFlagsSelector';
import { X, ShieldPlus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    name_en: string;
    name_bn: string;
    description_en?: string;
    permissions: string[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateRoleModal: React.FC<Props> = ({ onClose, onSubmit, isSubmitting }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [key, setKey] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      key: key.toUpperCase().replace(/\s+/g, '_').trim(),
      name_en: nameEn.trim(),
      name_bn: nameBn.trim(),
      description_en: desc.trim() || undefined,
      permissions: selectedPermissions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldPlus className="w-5 h-5 text-[#137C73]" />
            <span>{isBn ? 'নতুন কাস্টম ভূমিকা (Role) তৈরি' : 'Create Custom System Role'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'ভূমিকা কোড (UPPERCASE) *' : 'Role Key (UPPERCASE) *'}
              </label>
              <input
                type="text"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. TEACHER"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="শিক্ষক"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isBn ? 'নাম (English) *' : 'Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Teacher / Instructor"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isBn ? 'দায়িত্ব ও ভূমিকা বিবরণ' : 'Description of Responsibilities'}
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Responsible for classroom attendance and exam score grading."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            />
          </div>

          {/* Granular Permission Flags Selection */}
          <div className="pt-2">
            <PermissionFlagsSelector
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              {isSubmitting ? 'Creating...' : isBn ? 'ভূমিকা সংরক্ষণ করুন' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
