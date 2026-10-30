import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { admissionsApi } from '../../services/admissionsApi';
import type { StudentSearchItem } from '../../types/admissions';
import { AdmissionStatusChip } from '../../components/admissions/AdmissionStatusChip';
import {
  Search,
  UserCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  CalendarRange,
} from 'lucide-react';

export const StudentSelectorPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>('');
  const [students, setStudents] = useState<StudentSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async (searchQuery: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await admissionsApi.searchStudents(searchQuery);
      setStudents(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to search students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-700" />
            {isBn ? 'ভর্তির জন্য শিক্ষার্থী নির্বাচন' : 'Select Student for Admission'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'D03 এ নিবন্ধিত সক্রিয় শিক্ষার্থী অনুসন্ধান করুন এবং ভর্তির ধরন নির্বাচন করুন'
              : 'Search active students registered in D03 and choose admission workflow'}
          </p>
        </div>

        <Link
          to="/app/students/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
        >
          <span>{isBn ? '+ নতুন শিক্ষার্থী নিবন্ধন (D03)' : '+ Register New Student (D03)'}</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isBn
                  ? 'শিক্ষার্থীর নাম, আইডি নম্বর অথবা অভিভাবকের মোবাইল নম্বর লিখুন...'
                  : 'Search by student name, student ID, or guardian phone...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
          >
            {isBn ? 'অনুসন্ধান' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Student List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            {isBn ? 'শিক্ষার্থী তালিকা লোড হচ্ছে...' : 'Loading students...'}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            {isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found matching search criteria.'}
          </div>
        ) : (
          students.map((student) => {
            const isBlocked = !student.is_active || student.has_pending_duplicate;
            const hasPriorEnrollment = !!student.latest_enrollment;

            return (
              <div
                key={student.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {isBn ? student.name_bn : student.name_en}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {student.student_id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {student.gender === 'MALE'
                        ? isBn ? 'ছাত্র' : 'Male'
                        : isBn ? 'ছাত্রী' : 'Female'}
                    </span>
                    <AdmissionStatusChip status={student.status} size="sm" />
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {student.primary_guardian && (
                      <span>
                        {isBn ? 'অভিভাবক:' : 'Guardian:'}{' '}
                        <strong className="text-slate-800">
                          {isBn ? student.primary_guardian.name_bn : student.primary_guardian.name_en}
                        </strong>{' '}
                        ({student.primary_guardian.phone})
                      </span>
                    )}

                    {student.latest_enrollment && (
                      <span>
                        {isBn ? 'পূর্ববর্তী শ্রেণি:' : 'Previous Class:'}{' '}
                        <strong className="text-teal-700">
                          {isBn ? student.latest_enrollment.class_name_bn : student.latest_enrollment.class_name_en}
                        </strong>{' '}
                        ({student.latest_enrollment.period_label})
                      </span>
                    )}
                  </div>

                  {student.has_pending_duplicate && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {isBn
                          ? 'সন্দেহভাজন ডুপ্লিকেট কিউতে অপেক্ষমাণ; অ্যাডমিন রিভিউ ছাড়া ভর্তি সম্ভব নয়।'
                          : 'Duplicate review pending; admission blocked until verified.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Admission Flow Triggers */}
                <div className="flex flex-wrap items-center gap-2">
                  {isBlocked ? (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium">
                      {isBn ? 'ভর্তির অনুপযুক্ত' : 'Not Eligible'}
                    </span>
                  ) : (
                    <>
                      {/* Flow 1: New Admission */}
                      <button
                        type="button"
                        onClick={() => navigate(`/app/admissions/new/academic?student_id=${student.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isBn ? 'নতুন ভর্তি' : 'New Admission'}</span>
                      </button>

                      {/* Flow 2: Returning / Re-admission if has prior enrollment */}
                      {hasPriorEnrollment && (
                        <button
                          type="button"
                          onClick={() => navigate(`/app/admissions/returning/${student.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                          <span>{isBn ? 'পরবর্তী শিক্ষাবর্ষ' : 'Re-Admission'}</span>
                        </button>
                      )}

                      {/* Flow 3: Session Progression */}
                      <button
                        type="button"
                        onClick={() => navigate(`/app/admissions/session/${student.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isBn ? 'সেশন প্রগ্রেস' : 'Session Flow'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
