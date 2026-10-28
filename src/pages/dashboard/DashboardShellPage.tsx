import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Shield, User, ArrowRight } from 'lucide-react';

export const DashboardShellPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#10364A] to-[#1E5266] rounded-2xl p-8 text-white shadow-md">
        <h1 className="text-2xl font-bold mb-2">
          স্বাগতম, {user?.name_bn || user?.name_en}!
        </h1>
        <p className="text-sm text-teal-100 max-w-xl leading-relaxed">
          মাদ্রাসা ম্যানেজমেন্ট সিস্টেমের অথেন্টিকেশন ও এক্সেস কন্ট্রোল মডিউল (Deliverable 01) সক্রিয় রয়েছে।
        </p>
      </div>

      {/* Available Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.permissions?.includes('users.read') && (
          <Link
            to="/app/admin/users"
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#137C73] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#137C73] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">{t('nav_users')}</h3>
              <p className="text-xs text-slate-500">ব্যবহারকারীদের তালিকা, তৈরি, সম্পাদনা ও স্ট্যাটাস নিয়ন্ত্রণ।</p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#137C73] group-hover:translate-x-1 transition-transform">
              <span>ব্যবহারকারী তালিকায় যান</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        )}

        {user?.permissions?.includes('roles.read') && (
          <Link
            to="/app/admin/roles"
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#137C73] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#137C73] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">{t('nav_roles')}</h3>
              <p className="text-xs text-slate-500">অনুমোদিত ভূমিকা ও সিস্টেম অনুমতির পূর্ণাঙ্গ ম্যাট্রিক্স।</p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#137C73] group-hover:translate-x-1 transition-transform">
              <span>ম্যাট্রিক্স দেখুন</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        )}

        <Link
          to="/app/profile"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#137C73] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#137C73] flex items-center justify-center mb-4">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">{t('nav_profile')}</h3>
            <p className="text-xs text-slate-500">ব্যক্তিগত তথ্য আপডেট, পাসওয়ার্ড পরিবর্তন ও সেশন তথ্য।</p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-[#137C73] group-hover:translate-x-1 transition-transform">
            <span>প্রোফাইলে যান</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
};

