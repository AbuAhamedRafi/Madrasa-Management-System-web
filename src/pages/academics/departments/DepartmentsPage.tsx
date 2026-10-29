import React, { useEffect, useState } from 'react';
import { academicsApi } from '../../../services/academicsApi';
import { Department } from '../../../types/academics';
import { CreateDepartmentModal } from '../structure/components/CreateDepartmentModal';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Power } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const { hasPermission } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canManage = hasPermission('academics.manage_structure');

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await academicsApi.listDepartments();
      setDepartments(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleToggleStatus = async (dept: Department) => {
    try {
      setError(null);
      await academicsApi.updateDepartmentStatus(dept.id, !dept.is_active, 'Status updated from UI');
      await loadDepartments();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Cannot change department status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isBn ? 'একাডেমিক বিভাগসমূহ' : 'Academic Departments'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isBn
              ? 'কিতাব বিভাগ, আলিয়া বিভাগ, হিফজ ও নূরানী বিভাগের তালিকা ও অবস্থা'
              : 'Manage academic departments and their active state'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন বিভাগ' : 'New Department'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">{isBn ? 'কোড' : 'Code'}</th>
              <th className="py-3 px-4">{isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}</th>
              <th className="py-3 px-4">{isBn ? 'নাম (ইংরেজি)' : 'Name (English)'}</th>
              <th className="py-3 px-4">{isBn ? 'প্রোগ্রাম সংখ্যা' : 'Programs'}</th>
              <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
              {canManage && <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs text-slate-700">{dept.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{dept.name_bn}</td>
                  <td className="py-3 px-4 text-slate-700">{dept.name_en}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{dept.programs_count ?? 0}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        dept.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {dept.is_active ? (isBn ? 'সক্রিয়' : 'Active') : isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(dept)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Power className="w-3.5 h-3.5" />
                        {dept.is_active
                          ? isBn
                            ? 'নিষ্ক্রিয় করুন'
                            : 'Deactivate'
                          : isBn
                          ? 'সক্রিয় করুন'
                          : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateDepartmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadDepartments}
      />
    </div>
  );
};
