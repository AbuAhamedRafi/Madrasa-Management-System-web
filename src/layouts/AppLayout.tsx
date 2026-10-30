import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  GraduationCap,
  Network,
  CalendarRange,
  Layers,
  Building2,
  FolderTree,
  Contact,
  ShieldAlert,
  ClipboardList,
  UserPlus,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isBn = i18n.language.startsWith('bn');

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#1E5266] text-white font-semibold'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-[#F4F7FB] overflow-hidden">
      {/* Sidebar - Matching #10364A */}
      <aside className="w-64 bg-[#10364A] text-white flex flex-col justify-between shrink-0 shadow-xl overflow-y-auto">
        <div>
          {/* Logo Brand Header - Clickable Link to Dashboard */}
          <Link
            to="/app"
            className="p-5 flex items-center space-x-3 border-b border-white/10 hover:bg-white/[0.04] transition-colors group cursor-pointer"
            title={t('nav_dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#137C73] flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3C7.5 6 5 9.5 5 15v6h14v-6c0-5.5-2.5-9-7-12z" />
                <path
                  d="M12 14c-1.5-.75-3-.75-4 0v4c1-.75 2.5-.75 4 0 1.5-.75 3-.75 4 0v-4c-1-.75-2.5-.75-4 0z"
                  fill="currentColor"
                  fillOpacity="0.25"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm tracking-wide text-white leading-tight truncate group-hover:text-teal-200 transition-colors">
                মাদ্রাসা ম্যানেজমেন্ট
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider truncate">
                MMS DASHBOARD
              </div>
            </div>
          </Link>

          {/* Navigation Workspace */}
          <div className="px-4 py-4 space-y-5">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {t('section_workspace')}
              </div>
              <nav className="space-y-1">
                <NavLink to="/app" end className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  <span>{t('nav_dashboard')}</span>
                </NavLink>
              </nav>
            </div>

            {user?.permissions?.includes('academics.read') && (
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {t('section_academics')}
                </div>
                <nav className="space-y-1">
                  <NavLink to="/app/academics" end className={navLinkClass}>
                    <GraduationCap className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_academics')}</span>
                  </NavLink>
                  <NavLink to="/app/academics/structure" className={navLinkClass}>
                    <Network className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_hierarchy')}</span>
                  </NavLink>
                  <NavLink to="/app/academics/departments" className={navLinkClass}>
                    <FolderTree className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_departments')}</span>
                  </NavLink>
                  <NavLink to="/app/academics/periods" className={navLinkClass}>
                    <CalendarRange className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_periods')}</span>
                  </NavLink>
                  <NavLink to="/app/academics/offerings" className={navLinkClass}>
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_offerings')}</span>
                  </NavLink>
                </nav>
              </div>
            )}

            {user?.permissions?.includes('students.read') && (
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {t('section_students')}
                </div>
                <nav className="space-y-1">
                  <NavLink to="/app/students" className={navLinkClass}>
                    <Contact className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_students')}</span>
                  </NavLink>
                  {user?.permissions?.includes('students.review_duplicates') && (
                    <NavLink to="/app/admin/student-duplicates" className={navLinkClass}>
                      <ShieldAlert className="w-4 h-4 text-teal-400" />
                      <span>{t('nav_student_duplicates')}</span>
                    </NavLink>
                  )}
                </nav>
              </div>
            )}

            {user?.permissions?.includes('admissions.read') && (
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {t('section_admissions')}
                </div>
                <nav className="space-y-1">
                  <NavLink to="/app/admissions" end className={navLinkClass}>
                    <ClipboardList className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_admissions_workbench')}</span>
                  </NavLink>
                  {user?.permissions?.includes('admissions.create') && (
                    <NavLink to="/app/admissions/new/student" className={navLinkClass}>
                      <UserPlus className="w-4 h-4 text-teal-400" />
                      <span>{t('nav_admissions_new')}</span>
                    </NavLink>
                  )}
                </nav>
              </div>
            )}

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {t('section_administration')}
              </div>
              <nav className="space-y-1">
                {user?.permissions?.includes('institution.read') && (
                  <NavLink to="/app/admin/institution" className={navLinkClass}>
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_institution')}</span>
                  </NavLink>
                )}

                {user?.permissions?.includes('users.read') && (
                  <NavLink to="/app/admin/users" className={navLinkClass}>
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_users')}</span>
                  </NavLink>
                )}

                {user?.permissions?.includes('roles.read') && (
                  <NavLink to="/app/admin/roles" className={navLinkClass}>
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>{t('nav_roles')}</span>
                  </NavLink>
                )}

                <NavLink to="/app/profile" className={navLinkClass}>
                  <Settings className="w-4 h-4 text-teal-400" />
                  <span>{t('nav_settings')}</span>
                </NavLink>
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Footer matching #10364A design */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-3 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MMS v1.0</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Secure</span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-rose-500/15 hover:text-rose-300 transition-all cursor-pointer group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">{t('nav_logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            {isBn ? 'মাদ্রাসা ম্যানেজমেন্ট সিস্টেম / ওয়ার্কস্পেস' : 'MMS Platform / Workspace'}
          </div>

          <div className="flex items-center space-x-5">
            <LanguageSwitcher />

            <div
              onClick={() => navigate('/app/profile')}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#137C73]/15 text-[#137C73] font-bold text-xs flex items-center justify-center">
                {user?.name_en?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {isBn ? user?.name_bn || user?.name_en || user?.username : user?.name_en || user?.username}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
