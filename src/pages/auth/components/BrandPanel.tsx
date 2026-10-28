import React from 'react';
import { useTranslation } from 'react-i18next';

export const BrandPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full lg:w-1/2 bg-[#104452] p-12 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/30 pointer-events-none" />

      {/* Top Emblem / Logo */}
      <div className="flex items-center space-x-3 z-10">
        <div className="w-10 h-10 border border-teal-300/40 rounded-xl flex items-center justify-center font-bold text-lg text-teal-300">
          ⚙
        </div>
        <div className="text-xl font-bold tracking-wider">MMS</div>
      </div>

      {/* Center Geometric Illustration matching UI-01 */}
      <div className="my-12 flex justify-center z-10">
        <div className="w-32 h-36 border-4 border-teal-200/25 rounded-2xl flex items-center justify-center relative transform hover:scale-105 transition-transform duration-500">
          <div className="w-20 h-24 border-2 border-teal-200/40 rounded-xl flex items-center justify-center">
            <div className="w-8 h-10 border-t-2 border-l-2 border-teal-200/60 rotate-45" />
          </div>
        </div>
      </div>

      {/* Bottom Title & Tagline */}
      <div className="z-10">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-3 leading-snug">
          {t('app_name')}
        </h1>
        <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm">
          {t('app_subtitle')}
        </p>
      </div>
    </div>
  );
};
