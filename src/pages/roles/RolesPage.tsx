import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { Check, Download } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const { t } = useTranslation();

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

  const getCellDisplay = (roleKey: string, permKey: string) => {
    const role = rolesData?.find((r: any) => r.key === roleKey);
    const perm = role?.permissions?.find((p: any) => p.key === permKey);

    if (!perm) return <span className="text-slate-300 font-bold">—</span>;

    if (perm.access_level === 'ALLOWED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Check className="w-3.5 h-3.5" />
          <span>Allowed</span>
        </span>
      );
    }

    if (perm.access_level === 'RESTRICTED') {
      return <span className="text-xs font-medium text-amber-700">Restricted</span>;
    }

    if (perm.access_level === 'VIEW_ONLY') {
      return <span className="text-xs font-medium text-slate-600">View only</span>;
    }

    if (perm.access_level === 'OWN_ONLY') {
      return <span className="text-xs font-medium text-slate-600">Own actions</span>;
    }

    return <span className="text-xs font-medium text-slate-600">{perm.access_level}</span>;
  };

  const handleExportCsv = () => {
    if (!permissionsData || !rolesData) return;

    let csv = 'Permission,Module,Admin,Office Staff,Accounts\n';
    permissionsData.forEach((p: any) => {
      const adminHas = rolesData.find((r: any) => r.key === 'ADMIN')?.permissions.some((x: any) => x.key === p.key) ? 'Allowed' : '—';
      const staffHas = rolesData.find((r: any) => r.key === 'OFFICE_STAFF')?.permissions.some((x: any) => x.key === p.key) ? 'Allowed' : '—';
      const accHas = rolesData.find((r: any) => r.key === 'ACCOUNTS')?.permissions.some((x: any) => x.key === p.key) ? 'Allowed' : '—';
      csv += `"${p.label_en} (${p.key})","${p.module}","${adminHas}","${staffHas}","${accHas}"\n`;
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
    <div className="max-w-6xl mx-auto">
      {/* Header matching UI-05 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">Administration / Roles</div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permission Matrix</h1>
          <p className="text-xs text-slate-500">
            Seeded role capabilities with server-enforced checks. Changes are audited.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>{t('export_matrix')}</span>
        </button>
      </div>

      {rolesLoading || permsLoading ? (
        <div className="p-12 text-center text-slate-400">Loading permission matrix...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Permission</th>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">Office Staff</th>
                  <th className="px-6 py-4">Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsData?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.label_en}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {p.key} ({p.module})
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCellDisplay('ADMIN', p.key)}</td>
                    <td className="px-6 py-4">{getCellDisplay('OFFICE_STAFF', p.key)}</td>
                    <td className="px-6 py-4">{getCellDisplay('ACCOUNTS', p.key)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contractual notice banner matching UI-05 */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900 text-xs leading-relaxed">
        Permissions for future modules are defined as stable identifiers, but the actual routes and features are not implemented in Deliverable 01. An assigned permission never bypasses a missing route or data-scope rule.
      </div>
    </div>
  );
};

