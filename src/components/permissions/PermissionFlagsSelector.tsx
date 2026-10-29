import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { Shield, Search, CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react';

export interface PermissionItem {
  id: number;
  key: string;
  module: string;
  label_bn: string;
  label_en: string;
  description_bn?: string;
  description_en?: string;
  display_order: number;
}

interface Props {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PermissionFlagsSelector: React.FC<Props> = ({
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Fetch available permissions catalog from backend
  const { data: permissions = [], isLoading } = useQuery<PermissionItem[]>({
    queryKey: ['admin-permissions-catalog'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/permissions');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Module group labels
  const moduleLabels: Record<string, { en: string; bn: string }> = {
    D01_Identity: { en: 'D01 · User & Self-Service', bn: 'ডি০১ · ব্যবহারকারী ও প্রোফাইল' },
    D01_Users: { en: 'D01 · User Administration', bn: 'ডি০১ · অ্যাডমিন ব্যবহারকারী ব্যবস্থাপনা' },
    D01_Roles: { en: 'D01 · Roles & Security Policies', bn: 'ডি০১ · ভূমিকা ও নিরাপত্তা পলিসি' },
    D01_Audit: { en: 'D01 · Audit Logs & Forensic', bn: 'ডি০১ · অডিট ট্রেইল ও লগ' },
    D02_Academics: { en: 'D02 · Academic Structure & Setup', bn: 'ডি০২ · একাডেমিক কাঠামো ও সেটআপ' },
    D03_Students: { en: 'D03 · Student Directory & Bio', bn: 'ডি০৩ · শিক্ষার্থী তথ্যভাণ্ডার' },
    D04_Admissions: { en: 'D04 · Admissions Processing', bn: 'ডি০৪ · ভর্তি যাচাই ও অনুমোদন' },
    D05_Promotions: { en: 'D05 · Annual Promotions', bn: 'ডি০৫ · বার্ষিক প্রমোশন ও ট্রান্সক্রিপ্ট' },
    D06_Fees: { en: 'D06 · Fee Catalog & Discounts', bn: 'ডি০৬ · ফি স্ট্রাকচার ও বিশেষ ছাড়' },
    D07_PaymentSlips: { en: 'D07 · Slip Generation & Invoicing', bn: 'ডি০৭ · পেমেন্ট স্লিপ ইস্যু' },
    D08_CashPayments: { en: 'D08 · Counter Cash Registry', bn: 'ডি০৮ · ক্যাশ কাউন্টার ও রসিদ' },
    D09_Expenses: { en: 'D09 · Expense Vouchers & Petty Cash', bn: 'ডি০৯ · ভাউচার ও দৈনিক ব্যয়' },
    D11_Reports: { en: 'D11 · Financial & Academic Reports', bn: 'ডি১১ · আয়-ব্যয় ও অগ্রগতির রিপোর্ট' },
    D12_Settings: { en: 'D12 · Institutional Configuration', bn: 'ডি১২ · প্রাতিষ্ঠানিক সেটিংস ও ব্যাকআপ' },
  };

  // Filter permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return permissions;
    const q = searchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.key.toLowerCase().includes(q) ||
        p.label_en.toLowerCase().includes(q) ||
        p.label_bn.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q)
    );
  }, [permissions, searchQuery]);

  // Group by module
  const groupedModules = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    for (const p of filteredPermissions) {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    }
    return groups;
  }, [filteredPermissions]);

  const togglePermission = (key: string) => {
    if (disabled) return;
    if (selectedPermissions.includes(key)) {
      onChange(selectedPermissions.filter((k) => k !== key));
    } else {
      onChange([...selectedPermissions, key]);
    }
  };

  const toggleModuleAll = (moduleKey: string) => {
    if (disabled) return;
    const modulePermKeys = groupedModules[moduleKey]?.map((p) => p.key) || [];
    const allSelected = modulePermKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      // Remove all module permissions
      onChange(selectedPermissions.filter((k) => !modulePermKeys.includes(k)));
    } else {
      // Add all missing
      const toAdd = modulePermKeys.filter((k) => !selectedPermissions.includes(k));
      onChange([...selectedPermissions, ...toAdd]);
    }
  };

  const handleSelectAllGlobal = () => {
    if (disabled) return;
    const allKeys = permissions.map((p) => p.key);
    onChange(allKeys);
  };

  const handleClearAllGlobal = () => {
    if (disabled) return;
    onChange([]);
  };

  const toggleCollapse = (moduleKey: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center text-xs text-slate-400">
        Loading permission flags catalog...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      {/* Header with counter badge & global controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#137C73]" />
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'কার্যক্রম অনুমতি ফ্ল্যাগ (ম্যানুয়াল নির্বাচন)' : 'Functional Permission Flags (Manual Customization)'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#137C73]/10 text-[#137C73]">
              {selectedPermissions.length} / {permissions.length} active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? 'ব্যবহারকারীকে প্রতিটি নির্দিষ্ট কাজের আলাদা অনুমতি দিন। ভূমিকা ডিফল্ট হিসেবে কাজ করলেও আপনি যেকোনো ফ্ল্যাগ চালু বা বন্ধ করতে পারবেন।'
              : 'Select individual function permissions manually. Roles act as baseline presets, but you can toggle any flag.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSelectAllGlobal}
            disabled={disabled}
            className="px-3 py-1.5 text-xs font-semibold text-[#137C73] hover:bg-[#137C73]/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            {isBn ? 'সব নির্বাচন' : 'Select All'}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleClearAllGlobal}
            disabled={disabled}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            {isBn ? 'মুছে ফেলুন' : 'Clear All'}
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isBn ? 'পারমিশন বা মডিউল খুঁজুন...' : 'Search permission flag by key or name...'}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#137C73]/20 focus:border-[#137C73] transition-all"
        />
      </div>

      {/* Grouped Modules */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {Object.keys(groupedModules).map((moduleKey) => {
          const modulePerms = groupedModules[moduleKey];
          const isCollapsed = Boolean(collapsedModules[moduleKey]);
          const selectedInModule = modulePerms.filter((p) => selectedPermissions.includes(p.key)).length;
          const allInModuleSelected = selectedInModule === modulePerms.length && modulePerms.length > 0;
          const label = moduleLabels[moduleKey] || { en: moduleKey, bn: moduleKey };

          return (
            <div
              key={moduleKey}
              className="border border-slate-200/70 rounded-xl overflow-hidden bg-slate-50/50 transition-colors"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/50">
                <button
                  type="button"
                  onClick={() => toggleCollapse(moduleKey)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#137C73] cursor-pointer text-left"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isBn ? label.bn : label.en}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({selectedInModule}/{modulePerms.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleModuleAll(moduleKey)}
                  disabled={disabled}
                  className="text-[11px] font-semibold text-[#137C73] hover:underline cursor-pointer disabled:opacity-40"
                >
                  {allInModuleSelected
                    ? isBn
                      ? 'বাতিল করুন'
                      : 'Uncheck Module'
                    : isBn
                    ? 'মডিউলের সব নির্বাচন'
                    : 'Check Module'}
                </button>
              </div>

              {/* Module Permission Items Grid */}
              {!isCollapsed && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white">
                  {modulePerms.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#137C73]/5 border-[#137C73]/40 text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#137C73]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold leading-snug">
                            {isBn ? perm.label_bn : perm.label_en}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                            {perm.key}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
