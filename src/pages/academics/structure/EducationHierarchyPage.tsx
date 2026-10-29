import React, { useEffect, useState } from 'react';
import { academicsApi } from '../../../services/academicsApi';
import type { AcademicProgram, HierarchyAuthorityNode } from '../../../types/academics';
import { HierarchyTreePanel } from './components/HierarchyTreePanel';
import { SelectedProgramCard } from './components/SelectedProgramCard';
import { CreateDepartmentModal } from './components/CreateDepartmentModal';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';

export const EducationHierarchyPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();

  const [authorities, setAuthorities] = useState<HierarchyAuthorityNode[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [programStructure, setProgramStructure] = useState<AcademicProgram | null>(null);
  const [search, setSearch] = useState('');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const canManageStructure = hasPermission('academics.manage_structure');

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await academicsApi.getHierarchy(search ? { search } : undefined);
      setAuthorities(data);

      if (!selectedProgramId) {
        const firstProgram = data
          .flatMap((a) => a.levels)
          .flatMap((l) => l.departments)
          .flatMap((d) => d.programs)[0];
        if (firstProgram) {
          setSelectedProgramId(firstProgram.id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, [search]);

  useEffect(() => {
    if (selectedProgramId) {
      academicsApi.getProgramStructure(selectedProgramId).then(setProgramStructure);
    }
  }, [selectedProgramId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isBn ? 'শিক্ষা বোর্ড, বিভাগ ও প্রোগ্রাম কাঠামো' : 'Education Hierarchy & Programs'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isBn
              ? 'শিক্ষা বোর্ড/কর্তৃপক্ষ, স্তর, বিভাগ এবং একাডেমিক প্রোগ্রামের সম্পর্ক ব্যবস্থাপনা'
              : 'Manage education authorities, levels, departments and academic programs'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/app/academics/departments"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            {isBn ? 'বিভাগ তালিকা' : 'Departments List'}
          </Link>
          {canManageStructure && (
            <>
              <button
                type="button"
                onClick={() => setShowDeptModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-700 text-teal-700 bg-white text-xs font-medium hover:bg-teal-50"
              >
                <Plus className="w-4 h-4" />
                {isBn ? 'নতুন বিভাগ' : 'New Department'}
              </button>
              <Link
                to="/app/academics/programs/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
              >
                <Plus className="w-4 h-4" />
                {isBn ? 'নতুন প্রোগ্রাম' : 'New Program'}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            isBn
              ? 'প্রোগ্রামের নাম বা কোড দিয়ে খুঁজুন...'
              : 'Search programs by name or code...'
          }
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      {loading && authorities.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          {isBn ? 'শিক্ষা কাঠামো লোড হচ্ছে...' : 'Loading education hierarchy...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <HierarchyTreePanel
              authorities={authorities}
              selectedProgramId={selectedProgramId}
              onSelectProgram={setSelectedProgramId}
            />
          </div>
          <div className="lg:col-span-5">
            <SelectedProgramCard
              structure={programStructure}
              canManageStructure={canManageStructure}
            />
          </div>
        </div>
      )}

      <CreateDepartmentModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onCreated={loadHierarchy}
      />
    </div>
  );
};
