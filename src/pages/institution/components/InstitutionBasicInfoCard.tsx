import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  code: string;
  setCode: (val: string) => void;
  nameBn: string;
  setNameBn: (val: string) => void;
  nameEn: string;
  setNameEn: (val: string) => void;
  addressBn: string;
  setAddressBn: (val: string) => void;
  addressEn: string;
  setAddressEn: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  defaultLocale: 'bn-BD' | 'en';
  setDefaultLocale: (val: 'bn-BD' | 'en') => void;
  timezone: string;
  canUpdate: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const InstitutionBasicInfoCard: React.FC<Props> = ({
  code,
  setCode,
  nameBn,
  setNameBn,
  nameEn,
  setNameEn,
  addressBn,
  setAddressBn,
  addressEn,
  setAddressEn,
  phone,
  setPhone,
  defaultLocale,
  setDefaultLocale,
  timezone,
  canUpdate,
  submitting,
  onSubmit,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">
          {isBn ? 'প্রতিষ্ঠানের মৌলিক তথ্য (বাংলা ও ইংরেজি)' : 'Institution Identity & Bilingual Profile'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'রসিদ, আইডি কার্ড এবং রিপোর্টে ব্যবহৃত মাদ্রাসার নাম, ঠিকানা ও ভাষা সেটিংস'
            : 'Madrasa name, address and locale defaults used across headers, receipts and reports'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'প্রতিষ্ঠান কোড *' : 'Institution Code *'}
          </label>
          <input
            type="text"
            required
            disabled={!canUpdate}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'ফোন নম্বর' : 'Official Phone'}
          </label>
          <input
            type="text"
            disabled={!canUpdate}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'মাদ্রাসার নাম (বাংলা) *' : 'Institution Name (Bangla) *'}
          </label>
          <input
            type="text"
            required
            disabled={!canUpdate}
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'মাদ্রাসার নাম (ইংরেজি) *' : 'Institution Name (English) *'}
          </label>
          <input
            type="text"
            required
            disabled={!canUpdate}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}
          </label>
          <input
            type="text"
            disabled={!canUpdate}
            value={addressBn}
            onChange={(e) => setAddressBn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'ঠিকানা (ইংরেজি)' : 'Address (English)'}
          </label>
          <input
            type="text"
            disabled={!canUpdate}
            value={addressEn}
            onChange={(e) => setAddressEn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'ডিফল্ট ভাষা (Default Locale)' : 'Default System Locale'}
          </label>
          <select
            disabled={!canUpdate}
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value as 'bn-BD' | 'en')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="bn-BD">বাংলা (Bangla - Default)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isBn ? 'টাইমজোন' : 'Timezone'}
          </label>
          <input
            type="text"
            disabled
            value={timezone}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
          />
        </div>
      </div>

      {canUpdate && (
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
              : isBn
              ? 'প্রোফাইল সংরক্ষণ করুন'
              : 'Save Institution Profile'}
          </button>
        </div>
      )}
    </form>
  );
};
