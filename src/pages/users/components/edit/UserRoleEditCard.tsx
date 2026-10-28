import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, Calculator } from 'lucide-react';

interface Props {
  currentRoles: string[];
  onSubmit: (roles: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export const UserRoleEditCard: React.FC<Props> = ({ currentRoles, onSubmit, isSubmitting }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<string>(currentRoles[0] || 'OFFICE_STAFF');

  const roleDefinitions = [
    {
      key: 'ADMIN',
      title: 'Administrator',
      desc: 'Full administrative access: user provisioning, role assignments, audit logs, and settings.',
      icon: ShieldCheck,
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
    },
    {
      key: 'OFFICE_STAFF',
      title: 'Office Staff',
      desc: 'Institutional records: student profiles, admissions processing, and academic attendance.',
      icon: UserCheck,
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      key: 'ACCOUNTS',
      title: 'Accounts Clerk',
      desc: 'Financial management: fee structures, receipts collection, cash registry, and vouchers.',
      icon: Calculator,
      color: 'border-teal-200 bg-teal-50/40 text-teal-900',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit([selectedRole]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-800 mb-1">{t('role_management')}</h3>
      <p className="text-xs text-slate-500 mb-6">Select the primary system role governing module and action permissions.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roleDefinitions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            return (
              <div
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#137C73] bg-[#137C73]/5 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#137C73]' : 'text-slate-400'}`} />
                    <input
                      type="radio"
                      name="role"
                      checked={isSelected}
                      onChange={() => setSelectedRole(role.key)}
                      className="accent-[#137C73] cursor-pointer"
                    />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{role.title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{role.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || selectedRole === currentRoles[0]}
            className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0f665e] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? 'Updating...' : t('roles_updated')}
          </button>
        </div>
      </form>
    </div>
  );
};

