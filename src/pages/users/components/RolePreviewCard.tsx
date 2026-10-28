import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';

interface RolePreviewProps {
  role: string;
}

export const RolePreviewCard: React.FC<RolePreviewProps> = ({ role }) => {
  const { t } = useTranslation();

  const permissionsConfig: Record<string, { label: string; allowed: boolean }[]> = {
    OFFICE_STAFF: [
      { label: 'নিজস্ব প্রোফাইল ও পাসওয়ার্ড পরিবর্তন', allowed: true },
      { label: 'শিক্ষার্থী দেখুন ও তৈরি করুন (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'ভর্তি ও প্রমোশন (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'পেমেন্ট স্লিপ ইস্যু (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'নগদ লেনদেন পোস্ট করা', allowed: false },
      { label: 'ব্যবহারকারী পরিচালনা', allowed: false },
    ],
    ACCOUNTS: [
      { label: 'নিজস্ব প্রোফাইল ও পাসওয়ার্ড পরিবর্তন', allowed: true },
      { label: 'নগদ লেনদেন পোস্ট ও রসিদ প্রদান (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'আর্থিক প্রতিবেদন দেখুন (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'পেমেন্ট স্লিপ দেখুন', allowed: true },
      { label: 'শিক্ষার্থী ভর্তি অনুমোদন পরিবর্তন', allowed: false },
      { label: 'ব্যবহারকারী পরিচালনা', allowed: false },
    ],
    ADMIN: [
      { label: 'ব্যবহারকারী তৈরি, সম্পাদনা ও নিষ্ক্রিয়করণ', allowed: true },
      { label: 'ভূমিকা ও অনুমতি বরাদ্দকরণ', allowed: true },
      { label: 'একাডেমিক কাঠামো কনফিগারেশন (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'শিক্ষার্থী ও ভর্তি পরিচালনা (ভবিষ্যৎ ধাপ)', allowed: true },
      { label: 'আর্থিক প্রতিবেদন ও অডিট লগ পরিদর্শন', allowed: true },
      { label: 'নগদ কাউন্টার ক্যাশিয়ার (বিশেষ অনুমোদন সাপেক্ষ)', allowed: false },
    ],
  };

  const perms = permissionsConfig[role] || permissionsConfig.OFFICE_STAFF;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
      <h3 className="text-sm font-bold text-slate-800 mb-1">{t('role_preview_title')}</h3>
      <p className="text-xs text-slate-500 mb-4 font-mono">{role}</p>

      <div className="space-y-3 mb-6">
        {perms.map((p, idx) => (
          <div key={idx} className="flex items-start space-x-2 text-xs">
            {p.allowed ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <span className={p.allowed ? 'text-slate-700' : 'text-slate-400'}>{p.label}</span>
          </div>
        ))}
      </div>

      <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-800 text-xs leading-relaxed">
        {t('future_module_notice')}
      </div>
    </div>
  );
};
