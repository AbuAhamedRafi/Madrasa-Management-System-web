import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { RolePreviewCard } from './components/RolePreviewCard';
import { Copy, Check } from 'lucide-react';

export const CreateUserPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('OFFICE_STAFF');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/v1/admin/users', {
        name_bn: nameBn,
        name_en: nameEn,
        username,
        email: email || null,
        phone: phone || null,
        role,
      });

      const inviteUrl = response.data.data.invitation?.activation_url;
      setInvitationLink(inviteUrl);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'ব্যবহারকারী তৈরি ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Breadcrumb & Title matching UI-03 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">ব্যবস্থাপনা / ব্যবহারকারী / নতুন</div>
          <h1 className="text-2xl font-bold text-slate-900">নতুন ব্যবহারকারী তৈরি</h1>
          <p className="text-xs text-slate-500">শুধু অ্যাডমিন নতুন ব্যবহারকারী তৈরি ও ভূমিকা নির্ধারণ করতে পারবেন।</p>
        </div>

        <button
          onClick={() => navigate('/app/admin/users')}
          className="text-xs font-semibold px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          {t('back_to_users')}
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* One-time Invitation Modal Callout */}
      {invitationLink && (
        <div className="mb-6 p-6 bg-teal-50 border border-teal-200 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-teal-900 mb-2">ব্যবহারকারী সফলভাবে তৈরি হয়েছে!</h3>
          <p className="text-xs text-teal-700 mb-4">
            নিচের এককালীন অ্যাক্টিভেশন লিংকটি কপি করে ব্যবহারকারীকে দিন (৩০ মিনিট মেয়াদ):
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={invitationLink}
              className="flex-1 bg-white border border-teal-300 px-3.5 py-2 text-xs rounded-xl font-mono text-slate-700 select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#137C73] hover:bg-[#0F635C] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Grid matching UI-03 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">{t('personal_info')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('name_bn')}</label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="মোহাম্মদ সাদিক"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('name_en')}</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Mohammad Sadiq"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('username')}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sadiq.office"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">{t('username_hint')}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('phone')}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t('role')}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] bg-white cursor-pointer"
                >
                  <option value="OFFICE_STAFF">Office Staff</option>
                  <option value="ACCOUNTS">Accounts</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Green activation explanation box */}
            <div className="mt-6 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-1.5">
              <div className="font-semibold text-emerald-950 mb-1">{t('activation_method_title')}</div>
              <div>✓ {t('activation_method_desc_1')}</div>
              <div>✓ {t('activation_method_desc_2')}</div>
              <div>✓ {t('activation_method_desc_3')}</div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/app/admin/users')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0F635C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70 cursor-pointer"
              >
                {t('create_user_submit')}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Dynamic Role Permission Preview */}
        <div className="lg:col-span-1">
          <RolePreviewCard role={role} />
        </div>
      </div>
    </div>
  );
};
