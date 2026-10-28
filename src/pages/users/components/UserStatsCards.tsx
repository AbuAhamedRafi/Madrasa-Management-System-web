import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';

interface StatsProps {
  counts?: {
    total: number;
    active: number;
    invited: number;
    disabled: number;
  };
}

export const UserStatsCards: React.FC<StatsProps> = ({ counts }) => {
  const { t } = useTranslation();

  const cards = [
    { label: t('total_users'), value: counts?.total ?? 0, sub: 'All authorized accounts', icon: Users, color: 'text-slate-700' },
    { label: t('active_users'), value: counts?.active ?? 0, sub: 'Can sign in', icon: UserCheck, color: 'text-emerald-600' },
    { label: t('pending_users'), value: counts?.invited ?? 0, sub: 'Waiting for setup', icon: Clock, color: 'text-amber-600' },
    { label: t('disabled_users'), value: counts?.disabled ?? 0, sub: 'Access revoked', icon: UserX, color: 'text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-2">{card.label}</div>
          <div className={`text-3xl font-extrabold ${card.color} mb-1`}>{card.value}</div>
          <div className="text-xs text-slate-400">{card.sub}</div>
        </div>
      ))}
    </div>
  );
};

