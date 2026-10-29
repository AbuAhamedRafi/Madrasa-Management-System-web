import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Building2 } from 'lucide-react';

interface Props {
  logoUrl: string | null;
  nameBn: string;
  nameEn: string;
  addressBn: string;
  canUpdate: boolean;
  onUpload: (file: File) => Promise<void>;
}

export const InstitutionLogoCard: React.FC<Props> = ({
  logoUrl,
  nameBn,
  nameEn,
  addressBn,
  canUpdate,
  onUpload,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await onUpload(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {isBn ? 'প্রতিষ্ঠানের লোগো ও রসিদ হেডার প্রিভিউ' : 'Branding Logo & Receipt Header Preview'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isBn
            ? 'PNG বা JPG ফরম্যাট (সর্বোচ্চ ২ মেগাবাইট)'
            : 'Allowed formats: PNG or JPG (Max size: 2 MB)'}
        </p>
      </div>

      {/* Live Header Preview */}
      <div className="p-4 rounded-xl bg-teal-950 text-white flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-7 h-7 text-teal-300" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm truncate">{nameBn || 'মাদ্রাসার নাম'}</div>
          <div className="text-xs text-teal-200 truncate">{nameEn || 'Madrasa Name'}</div>
          {addressBn && (
            <div className="text-[11px] text-teal-300/80 truncate mt-0.5">{addressBn}</div>
          )}
        </div>
      </div>

      {canUpdate && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-teal-700 text-teal-700 bg-teal-50/50 text-xs font-semibold hover:bg-teal-50 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading
              ? isBn
                ? 'আপলোড হচ্ছে...'
                : 'Uploading...'
              : isBn
              ? 'নতুন লোগো আপলোড করুন (PNG / JPG)'
              : 'Upload New Logo (PNG / JPG)'}
          </button>
        </div>
      )}
    </div>
  );
};

