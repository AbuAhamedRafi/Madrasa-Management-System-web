import React from 'react';
import type { AcademicSummary } from '../../../../types/academics';
import { useTranslation } from 'react-i18next';
import { Building2, GraduationCap, CalendarCheck, Layers } from 'lucide-react';

interface Props {
  metrics: AcademicSummary;
}

export const SummaryMetricsGrid: React.FC<Props> = ({ metrics }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const cards = [
    {
      label: isBn ? 'সক্রিয় বিভাগ' : 'Active Departments',
      value: metrics.active_departments_count,
      sub: isBn ? 'মোট সক্রিয় একাডেমিক বিভাগ' : 'Total active academic departments',
      icon: Building2,
    },
    {
      label: isBn ? 'সক্রিয় প্রোগ্রাম / ধারা' : 'Active Programs / Streams',
      value: metrics.active_programs_count,
      sub: isBn ? `মোট ${metrics.programs_count}টি প্রোগ্রাম` : `Out of ${metrics.programs_count} total programs`,
      icon: GraduationCap,
    },
    {
      label: isBn ? 'চলমান শিক্ষাবর্ষ / পিরিয়ড' : 'Open Study Periods',
      value: metrics.open_periods_count,
      sub: isBn ? `মোট ${metrics.total_periods_count}টি পিরিয়ড` : `Out of ${metrics.total_periods_count} total periods`,
      icon: CalendarCheck,
    },
    {
      label: isBn ? 'মোট শাখা ও আসন' : 'Active Sections & Seats',
      value: metrics.sections_count,
      sub: isBn ? `মোট আসন: ${metrics.total_configured_seats}` : `Total capacity: ${metrics.total_configured_seats}`,
      icon: Layers,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-start justify-between"
          >
            <div>
              <div className="text-xs font-medium text-slate-500">{card.label}</div>
              <div className="mt-1.5 text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
