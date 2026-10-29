import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PermissionFlagsSelector } from '../../../../components/permissions/PermissionFlagsSelector';
import { ShieldAlert } from 'lucide-react';

interface Props {
  currentPermissions: string[];
  onSubmit: (permissions: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export const UserPermissionEditCard: React.FC<Props> = ({
  currentPermissions,
  onSubmit,
  isSubmitting,
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [permissions, setPermissions] = useState<string[]>(currentPermissions);

  useEffect(() => {
    setPermissions(currentPermissions);
  }, [currentPermissions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(permissions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PermissionFlagsSelector
        selectedPermissions={permissions}
        onChange={setPermissions}
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>
            {isBn
              ? 'পরিবর্তিত অনুমতি তাৎক্ষণিকভাবে ব্যবহারকারীর পরবর্তী রিকোয়েস্টে কার্যকর হবে।'
              : 'Direct permissions override or supplement base role permissions.'}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-[#137C73] hover:bg-[#0f665e] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : isBn ? 'অনুমতি ফ্ল্যাগ সংরক্ষণ করুন' : 'Save Permission Flags'}
        </button>
      </div>
    </form>
  );
};
