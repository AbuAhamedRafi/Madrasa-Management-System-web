import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { UserStatsCards } from './components/UserStatsCards';
import { UsersFilterBar } from './components/UsersFilterBar';
import { UsersTable } from './components/UsersTable';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, role, status, page],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/users', {
        params: { search, role, status, page, page_size: 10 },
      });
      return response.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Administration / Users
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('nav_users')}</h1>
          <p className="text-xs text-slate-500">Manage authorized Admin, Office Staff and Accounts users.</p>
        </div>

        <Link
          to="/app/admin/users/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#137C73] hover:bg-[#0F635C] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          {t('create_user_button')}
        </Link>
      </div>

      {/* KPI Stats Row */}
      <UserStatsCards counts={data?.meta?.counts} />

      {/* Filter and Table */}
      <UsersFilterBar
        search={search}
        role={role}
        status={status}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        onReset={() => {
          setSearch('');
          setRole('ALL');
          setStatus('ALL');
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading user directory...</div>
      ) : (
        <UsersTable
          users={data?.data || []}
          meta={data?.meta}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

