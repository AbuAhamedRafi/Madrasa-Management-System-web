import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('mms_locale', locale);
  };

  return (
    <div className="relative inline-flex items-center text-sm font-medium">
      <Globe className="w-4 h-4 mr-1.5 text-slate-500" />
      <select
        value={i18n.language}
        onChange={(e) => toggleLanguage(e.target.value)}
        className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] cursor-pointer"
      >
        <option value="bn-BD">বাংলা</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};
