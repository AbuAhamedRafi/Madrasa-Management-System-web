import React, { useEffect, useState } from 'react';
import { academicsApi } from '../../services/academicsApi';
import { InstitutionBasicInfoCard } from './components/InstitutionBasicInfoCard';
import { InstitutionLogoCard } from './components/InstitutionLogoCard';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const InstitutionSettingsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const { hasPermission } = useAuth();

  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [defaultLocale, setDefaultLocale] = useState<'bn' | 'en'>('bn');
  const [timezone, setTimezone] = useState('Asia/Dhaka');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canUpdate = hasPermission('institution.update');

  const loadProfile = async () => {
    const inst = await academicsApi.getInstitution();
    setCode(inst.code);
    setNameBn(inst.name_bn);
    setNameEn(inst.name_en);
    setAddressBn(inst.address_bn ?? '');
    setAddressEn(inst.address_en ?? '');
    setPhone(inst.phone ?? '');
    setLogoUrl(inst.logo_url);
    setDefaultLocale(inst.default_locale);
    setTimezone(inst.timezone);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const updated = await academicsApi.updateInstitution({
        code,
        name_bn: nameBn,
        name_en: nameEn,
        address_bn: addressBn || null,
        address_en: addressEn || null,
        phone: phone || null,
        default_locale: defaultLocale,
        timezone,
      });
      setCode(updated.code);
      setSuccessMsg(
        isBn
          ? 'প্রতিষ্ঠানের তথ্য সফলভাবে সংরক্ষিত হয়েছে।'
          : 'Institution profile updated successfully.'
      );
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update institution profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const updated = await academicsApi.uploadInstitutionLogo(file);
      setLogoUrl(updated.logo_url);
      setSuccessMsg(
        isBn ? 'লোগো সফলভাবে আপলোড করা হয়েছে।' : 'Institution logo uploaded successfully.'
      );
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to upload logo.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {isBn ? 'প্রতিষ্ঠানের প্রোফাইল ও ব্র্যান্ডিং সেটিংস' : 'Institution Profile & Branding Settings'}
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          {isBn
            ? 'মাদ্রাসার অফিশিয়াল নাম, কোড, ঠিকানা, লোগো এবং ভাষা সেটিংস পরিচালনা করুন'
            : 'Configure your madrasa identity, bilingual names, logo and default locale'}
        </p>
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
        <div className="lg:col-span-8">
          <InstitutionBasicInfoCard
            code={code}
            setCode={setCode}
            nameBn={nameBn}
            setNameBn={setNameBn}
            nameEn={nameEn}
            setNameEn={setNameEn}
            addressBn={addressBn}
            setAddressBn={setAddressBn}
            addressEn={addressEn}
            setAddressEn={setAddressEn}
            phone={phone}
            setPhone={setPhone}
            defaultLocale={defaultLocale}
            setDefaultLocale={setDefaultLocale}
            timezone={timezone}
            canUpdate={canUpdate}
            submitting={submitting}
            onSubmit={handleSaveProfile}
          />
        </div>

        <div className="lg:col-span-4">
          <InstitutionLogoCard
            logoUrl={logoUrl}
            nameBn={nameBn}
            nameEn={nameEn}
            addressBn={addressBn}
            canUpdate={canUpdate}
            onUpload={handleUploadLogo}
          />
        </div>
      </div>
    </div>
  );
};
