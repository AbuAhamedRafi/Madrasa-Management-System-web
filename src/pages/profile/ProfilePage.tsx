import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t, i18n } = useTranslation();

  const [nameEn, setNameEn] = useState(user?.name_en || '');
  const [nameBn, setNameBn] = useState(user?.name_bn || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLocale, setPreferredLocale] = useState(user?.preferred_locale || 'bn-BD');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await apiClient.patch('/api/v1/me', {
        name_en: nameEn,
        name_bn: nameBn,
        email: email || null,
        phone: phone || null,
        preferred_locale: preferredLocale,
      });
      i18n.changeLanguage(preferredLocale);
      localStorage.setItem('mms_locale', preferredLocale);
      await refreshUser();
      setProfileMsg('প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
    } catch (err: any) {
      setProfileMsg(err.response?.data?.error?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('নতুন পাসওয়ার্ড নিশ্চিতকরণের সাথে মেলেনি।');
      return;
    }

    try {
      await apiClient.put('/api/v1/me/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-1">Home / My Profile</div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile & Security</h1>
        <p className="text-xs text-slate-500">Update your personal information and secure your account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card: Personal Profile */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
              {user?.name_en?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-bold text-slate-900">{user?.name_en}</div>
              <div className="text-xs text-slate-400 font-mono">
                {user?.roles?.[0]} · {user?.username}
              </div>
            </div>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          {profileMsg && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name (Bangla)</label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Language</label>
              <select
                value={preferredLocale}
                onChange={(e) => setPreferredLocale(e.target.value as 'bn-BD' | 'en')}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] bg-white cursor-pointer"
              >
                <option value="bn-BD">বাংলা (Bangla)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0F635C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                {t('save_profile')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Password & Session Security */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">{t('password_security_title')}</h2>
            <p className="text-xs text-slate-500 mb-5">
              Minimum 12 characters, numbers and mixed case enforced.
            </p>

            {passwordMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {passwordMsg}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('current_password')}</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('new_password')}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('confirm_new_password')}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0F635C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {t('change_password_submit')}
                </button>
              </div>
            </form>
          </div>

          {/* Session Details Box matching UI-04 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-xs text-slate-600 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm mb-2">{t('session_details')}</h3>
            <div>Current role: <span className="font-semibold text-slate-800">{user?.roles?.[0]}</span></div>
            <div>
              Last login: <span className="text-slate-800">{user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Just now'}</span>
            </div>
            <div className="text-slate-400">Other sessions: managed by security policy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
