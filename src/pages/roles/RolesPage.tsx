import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { CreateRoleModal } from './components/CreateRoleModal';
import { CreatePermissionModal } from './components/CreatePermissionModal';
import { Check, Download, Shield, Key } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const queryClient = useQueryClient();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/roles');
      return res.data.data;
    },
  });

  const { data: permissionsData, isLoading: permsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/permissions');
      return res.data.data;
    },
  });

  // Mutation: Create Custom Role
  const createRoleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/admin/roles', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowRoleModal(false);
      showNotification(
        isBn
          ? `নতুন ভূমিকা [${data.name_bn || data.name_en}] সফলভাবে তৈরি হয়েছে!`
          : `Custom role [${data.name_en}] created successfully!`
      );
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create role.');
    },
  });

  // Mutation: Create Custom Permission Flag
  const createPermMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/admin/permissions', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-permissions-catalog'] });
      setShowPermModal(false);
      showNotification(
        isBn
          ? `নতুন পারমিশন ফ্ল্যাগ [${data.key}] যুক্ত হয়েছে!`
          : `Permission flag [${data.key}] created successfully!`
      );
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create permission flag.');
    },
  });

  const getCellDisplay = (roleKey: string, permKey: string) => {
    const role = rolesData?.find((r: any) => r.key === roleKey);
    const perm = role?.permissions?.find((p: any) => p.key === permKey);

    if (!perm) return <span className="text-slate-300 font-bold">—</span>;

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        <Check className="w-3.5 h-3.5" />
        <span>Allowed</span>
      </span>
    );
  };

  const handleExportCsv = () => {
    if (!permissionsData || !rolesData) return;

    const roleHeaders = rolesData.map((r: any) => r.name_en).join(',');
    let csv = `Permission,Key,Module,${roleHeaders}\n`;

    permissionsData.forEach((p: any) => {
      const roleChecks = rolesData
        .map((r: any) => (r.permissions?.some((x: any) => x.key === p.key) ? 'Allowed' : '—'))
        .join(',');
      csv += `"${p.label_en}","${p.key}","${p.module}",${roleChecks}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MMS_Roles_Permission_Matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            {isBn ? 'প্রশাসন / ভূমিকা ও পারমিশন' : 'Administration / Roles & Permissions'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isBn ? 'ভূমিকা ও পারমিশন ম্যাট্রিক্স ও কাস্টমাইজেশন' : 'Roles & Permission Matrix Customization'}
          </h1>
          <p className="text-xs text-slate-500">
            {isBn
              ? 'সিস্টেমের সকল ভূমিকার অনুমতি ম্যাট্রিক্স। আপনি যেকোনো কাস্টম ভূমিকা ও পারমিশন ফ্ল্যাগ যুক্ত করতে পারবেন।'
              : 'Granular function flags and role access matrix. Add custom roles or define new permission flags.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowPermModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#137C73]" />
            <span>{isBn ? '+ পারমিশন ফ্ল্যাগ' : '+ Add Permission Flag'}</span>
          </button>

          <button
            onClick={() => setShowRoleModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#137C73] hover:bg-[#0f665e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>{isBn ? '+ কাস্টম ভূমিকা (Role)' : '+ Add Custom Role'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>{t('export_matrix')}</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-fade-in">
          {feedbackNotice}
        </div>
      )}

      {rolesLoading || permsLoading ? (
        <div className="p-12 text-center text-slate-400">Loading permission matrix...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Function / Permission Flag</th>
                  {rolesData?.map((role: any) => (
                    <th key={role.id} className="px-6 py-4">
                      <div className="text-slate-900 font-bold">{isBn ? role.name_bn || role.name_en : role.name_en}</div>
                      <div className="text-[10px] text-slate-400 font-mono normal-case">{role.key}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsData?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">
                        {isBn ? p.label_bn : p.label_en}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.key} · <span className="text-slate-500">{p.module}</span>
                      </div>
                    </td>
                    {rolesData?.map((role: any) => (
                      <td key={role.id} className="px-6 py-3.5">
                        {getCellDisplay(role.key, p.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showRoleModal && (
        <CreateRoleModal
          onClose={() => setShowRoleModal(false)}
          onSubmit={async (data) => {
            await createRoleMutation.mutateAsync(data);
          }}
          isSubmitting={createRoleMutation.isPending}
        />
      )}

      {showPermModal && (
        <CreatePermissionModal
          onClose={() => setShowPermModal(false)}
          onSubmit={async (data) => {
            await createPermMutation.mutateAsync(data);
          }}
          isSubmitting={createPermMutation.isPending}
        />
      )}
    </div>
  );
};
