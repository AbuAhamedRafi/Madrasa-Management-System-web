import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

interface ProfileEditData {
  name_bn: string;
  name_en: string;
  email?: string;
  phone?: string;
}

interface Props {
  user: {
    id: string;
    username: string;
    name_bn: string;
    name_en: string;
    email: string | null;
    phone: string | null;
  };
  onSubmit: (data: ProfileEditData) => Promise<void>;
  isSubmitting: boolean;
}

export const UserProfileEditCard: React.FC<Props> = ({ user, onSubmit, isSubmitting }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileEditData>({
    defaultValues: {
      name_bn: user.name_bn,
      name_en: user.name_en,
      email: user.email || '',
      phone: user.phone || '',
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-800 mb-1">{t('personal_info')}</h3>
      <p className="text-xs text-slate-500 mb-6">Update the staff member's core identification and contact information.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Read-only system identifier and username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">System ID</label>
            <div className="font-mono text-sm font-semibold text-slate-700">{user.id}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('username')}</label>
            <div className="font-mono text-sm font-semibold text-slate-700">{user.username}</div>
          </div>
        </div>

        {/* Editable Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('name_bn')}</label>
            <input
              {...register('name_bn', { required: true })}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]/20 focus:border-[#137C73]"
            />
            {errors.name_bn && <span className="text-xs text-rose-500 mt-1 block">Name in Bangla is required</span>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('name_en')}</label>
            <input
              {...register('name_en', { required: true })}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]/20 focus:border-[#137C73]"
            />
            {errors.name_en && <span className="text-xs text-rose-500 mt-1 block">Name in English is required</span>}
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('email')}</label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. staff@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]/20 focus:border-[#137C73]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('phone')}</label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="+8801700000000"
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]/20 focus:border-[#137C73]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0f665e] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : t('save_changes')}
          </button>
        </div>
      </form>
    </div>
  );
};
