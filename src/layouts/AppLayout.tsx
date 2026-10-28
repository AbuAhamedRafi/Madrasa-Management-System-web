import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LayoutDashboard, Users, ShieldCheck, Settings, LogOut } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#F4F7FB] overflow-hidden">
      {/* Sidebar - Matching #10364A */}
      <aside className="w-64 bg-[#10364A] text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-lg bg-[#137C73] flex items-center justify-center font-bold text-lg text-white shadow-md">
              ⚙
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white leading-tight">মাদ্রাসা ম্যানেজমেন্ট</div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">MADRASA MANAGEMENT SYSTEM</div>
            </div>
          </div>

          {/* Navigation Workspace */}
          <div className="px-4 py-5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
              Workspace
            </div>
            <nav className="space-y-1.5">
              <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#1E5266] text-white font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                <span>{t('nav_dashboard')}</span>
              </NavLink>

              {user?.permissions?.includes('users.read') && (
                <NavLink
                  to="/app/admin/users"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#1E5266] text-white font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>{t('nav_users')}</span>
                </NavLink>
              )}

              {user?.permissions?.includes('roles.read') && (
                <NavLink
                  to="/app/admin/roles"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#1E5266] text-white font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>{t('nav_roles')}</span>
                </NavLink>
              )}

              <NavLink
                to="/app/profile"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#1E5266] text-white font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Settings className="w-4 h-4 text-teal-400" />
                <span>{t('nav_settings')}</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>MMS v1.0 · Secure session</span>
          <button
            onClick={() => logout()}
            className="text-slate-300 hover:text-red-400 transition-colors p-1"
            title={t('nav_logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            MMS Platform / Workspace
          </div>

          <div className="flex items-center space-x-5">
            <LanguageSwitcher />

            {/* User Profile Avatar Pill */}
            <div
              onClick={() => navigate('/app/profile')}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#137C73]/15 text-[#137C73] font-bold text-xs flex items-center justify-center">
                {user?.name_en?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {user?.name_en || user?.username}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
