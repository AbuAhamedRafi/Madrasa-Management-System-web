import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { BrandPanel } from '../auth/components/BrandPanel';

export const ActivatePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== passwordConfirmation) {
      setErrorMessage('পাসওয়ার্ড নিশ্চিতকরণ মেলেনি।');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/v1/auth/activate', {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'অ্যাকাউন্ট সক্রিয়করণ ব্যর্থ হয়েছে। লিংকটি মেয়াদোত্তীর্ণ বা ব্যবহৃত হতে পারে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3140] to-[#104452] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1180px] w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[580px] border border-white/10">
        <BrandPanel />

        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">অ্যাকাউন্ট পাসওয়ার্ড সেট করুন</h2>
            <p className="text-sm text-slate-500 mb-6">
              আপনার অ্যাকাউন্টে প্রবেশের জন্য ন্যূনতম ১২ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।
            </p>

            {isSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                <div className="text-emerald-900 font-bold text-base">অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে!</div>
                <p className="text-xs text-emerald-700">এখন আপনার ইউজারনেম এবং নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-[#137C73] hover:bg-[#0F635C] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  লগইন পাতায় যান →
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('new_password')}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">কমপক্ষে ১২ অক্ষর, সংখ্যা ও বড়/ছোট হাতের অক্ষর প্রয়োজন।</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('confirm_new_password')}</label>
                  <input
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 bg-[#137C73] hover:bg-[#0F635C] text-white font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? 'প্রসেসিং...' : 'পাসওয়ার্ড সেট ও সক্রিয় করুন →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
