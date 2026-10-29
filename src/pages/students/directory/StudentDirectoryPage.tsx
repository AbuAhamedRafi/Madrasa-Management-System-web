import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { Student } from '../../../types/students';
import { StudentStatusBadge } from '../../../components/students/StudentStatusBadge';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  UserCheck,
  PhoneCall,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const StudentDirectoryPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, page_size: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [admissionYear, setAdmissionYear] = useState('');

  const canCreate = hasPermission('students.create');

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await studentsApi.getStudents({
        query: query.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        admission_year: admissionYear ? Number(admissionYear) : undefined,
        page,
        page_size: 20,
      });
      setStudents(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [status, admissionYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleReset = () => {
    setQuery('');
    setStatus('ALL');
    setAdmissionYear('');
    studentsApi.getStudents({ page: 1, page_size: 20 }).then((res) => {
      setStudents(res.data);
      setMeta(res.meta);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#137C73] uppercase mb-1">
            {isBn ? 'শিক্ষার্থী পরিচিতি মডিউল' : 'Student Identity Module'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isBn ? 'শিক্ষার্থী তালিকা ও ডিরেক্টরি' : 'Student Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'স্থায়ী শিক্ষার্থী আইডি, নাম ও অভিভাবকের তথ্য দিয়ে সহজে অনুসন্ধান করুন'
              : 'Search and manage student profiles, permanent student IDs and guardians'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreate && (
            <Link
              to="/app/students/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#137C73] text-white text-xs font-semibold hover:bg-[#0f635c] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? '+ নতুন শিক্ষার্থী ভর্তি' : '+ New Student Admission'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {isBn ? 'মোট শিক্ষার্থী' : 'Total Registered'}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {meta.total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
            <div className="text-[11px] text-teal-600 mt-0.5">
              {isBn ? 'নিবন্ধিত প্রোফাইল' : 'Identity profiles'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {isBn ? 'সক্রিয় শিক্ষার্থী' : 'Active Students'}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {students
                .filter((s) => s.status === 'ACTIVE')
                .length.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              {isBn ? 'ফি পরিশোধকৃত / চলমান' : 'Enrolled & Active'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {isBn ? 'অভিভাবক সংযুক্ত' : 'Guardians Linked'}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {students
                .filter((s) => !!s.primary_guardian)
                .length.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
            <div className="text-[11px] text-teal-600 mt-0.5">
              {isBn ? 'প্রাইমারি কন্টাক্ট' : 'Primary contacts'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {isBn ? 'ডুপ্লিকেট পর্যালোচনা' : 'Duplicate Reviews'}
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {isBn ? 'কিউ দেখুন' : 'Queue'}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">
              <Link to="/app/admin/student-duplicates" className="hover:underline">
                {isBn ? 'অ্যাডমিন কিউ →' : 'Admin Queue →'}
              </Link>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isBn
                    ? 'আইডি / নাম / মোবাইল নম্বর দিয়ে খুঁজুন...'
                    : 'Search student ID, name, or phone...'
                }
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#137C73]"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            >
              <option value="ALL">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="REGISTERED">{isBn ? 'নিবন্ধিত (REGISTERED)' : 'Registered'}</option>
              <option value="ACTIVE">{isBn ? 'সক্রিয় (ACTIVE)' : 'Active'}</option>
              <option value="INACTIVE">{isBn ? 'নিষ্ক্রিয় (INACTIVE)' : 'Inactive'}</option>
              <option value="WITHDRAWN">{isBn ? 'প্রত্যাহারকৃত (WITHDRAWN)' : 'Withdrawn'}</option>
              <option value="TRANSFERRED">{isBn ? 'স্থানান্তরিত (TRANSFERRED)' : 'Transferred'}</option>
              <option value="GRADUATED">{isBn ? 'উত্তীর্ণ (GRADUATED)' : 'Graduated'}</option>
              <option value="ARCHIVED">{isBn ? 'আর্কাইভ (ARCHIVED)' : 'Archived'}</option>
            </select>

            <select
              value={admissionYear}
              onChange={(e) => setAdmissionYear(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#137C73]"
            >
              <option value="">{isBn ? 'সব শিক্ষাবর্ষ' : 'All Admission Years'}</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-[#137C73] text-white text-xs font-semibold hover:bg-[#0f635c] transition-colors"
            >
              {isBn ? 'খুঁজুন' : 'Search'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBn ? 'রিসেট' : 'Reset'}</span>
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">{isBn ? 'শিক্ষার্থী' : 'Student'}</th>
                <th className="py-3 px-4">{isBn ? 'স্থায়ী আইডি' : 'Student ID'}</th>
                <th className="py-3 px-4">{isBn ? 'অভিভাবক' : 'Guardian'}</th>
                <th className="py-3 px-4">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</th>
                <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading students...'}
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found matching query.'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name_bn.charAt(0) || student.name_en.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">
                            {student.name_bn}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {student.name_en}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                        {student.student_id}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {student.primary_guardian ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {isBn
                              ? student.primary_guardian.name_bn
                              : student.primary_guardian.name_en}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {student.primary_guardian.relation}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">
                          {isBn ? 'সংযুক্ত নেই' : 'None linked'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {student.primary_guardian?.phone || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <StudentStatusBadge status={student.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/app/students/${student.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-teal-700 text-xs font-semibold hover:bg-teal-50 transition-colors shadow-2xs"
                      >
                        <span>{isBn ? 'বিস্তারিত' : 'View'}</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.total_pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              {isBn
                ? `পৃষ্ঠা ${meta.page} / মোট ${meta.total_pages}`
                : `Page ${meta.page} of ${meta.total_pages}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => fetchStudents(meta.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.total_pages}
                onClick={() => fetchStudents(meta.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informational Callout */}
      <div className="p-4 rounded-xl bg-[#edf6fa] border border-[#d4e7f0] text-xs text-[#355364] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
        <div>
          {isBn
            ? 'নোট: শ্রেণি ও সেশন ভিত্তিক একাডেমিক এনরোলমেন্ট D04 মডিউলে যুক্ত হবে। শিক্ষার্থীর প্রোফাইল তৈরি হওয়া মাত্রই শিক্ষার্থীকে নিবন্ধিত ধরা হবে।'
            : 'Note: Class and academic session enrollment belongs to Deliverable D04. Registering a student profile establishes their permanent identity.'}
        </div>
      </div>
    </div>
  );
};
