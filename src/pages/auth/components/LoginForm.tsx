import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [doNotRemember, setDoNotRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(loginId, password, doNotRemember);
      navigate('/app');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-white">
      {/* Top Language Switcher */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* Main Form Fields */}
      <div className="max-w-md w-full mx-auto my-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1.5">{t('login_title')}</h2>
        <p className="text-sm text-slate-500 mb-6">{t('login_subtitle')}</p>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('identifier_label')}
            </label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder={t('identifier_placeholder')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('password_label')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] focus:border-transparent transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={doNotRemember}
                onChange={(e) => setDoNotRemember(e.target.checked)}
                className="rounded text-[#137C73] focus:ring-[#137C73]"
              />
              <span>{t('remember_me_not')}</span>
            </label>
            <a href="#help" className="text-slate-500 hover:text-[#137C73] transition-colors">
              {t('account_help')}
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-[#137C73] hover:bg-[#0F635C] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{t('login_button')}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          {t('secure_connection')}
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
        {t('copyright')}
      </div>
    </div>
  );
};
