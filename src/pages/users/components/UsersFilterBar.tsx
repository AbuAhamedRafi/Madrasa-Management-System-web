import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface FilterProps {
  search: string;
  role: string;
  status: string;
  onSearchChange: (val: string) => void;
  onRoleChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export const UsersFilterBar: React.FC<FilterProps> = ({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onReset,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73]"
        />
      </div>

      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="w-full sm:w-44 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] cursor-pointer"
      >
        <option value="ALL">{t('filter_all_roles')}</option>
        <option value="ADMIN">Admin</option>
        <option value="OFFICE_STAFF">Office Staff</option>
        <option value="ACCOUNTS">Accounts</option>
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full sm:w-44 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137C73] cursor-pointer"
      >
        <option value="ALL">{t('filter_all_statuses')}</option>
        <option value="ACTIVE">Active</option>
        <option value="INVITED">Invited</option>
        <option value="DISABLED">Disabled</option>
      </select>

      <button
        onClick={onReset}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
      >
        {t('reset_button')}
      </button>
    </div>
  );
};
