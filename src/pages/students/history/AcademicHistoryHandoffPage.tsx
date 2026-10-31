import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { StudentProfile } from '../../../types/students';
import { StudentStatusBadge } from '../../../components/students/StudentStatusBadge';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export const AcademicHistoryHandoffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    studentsApi
      .getStudent(Number(id))
      .then((data) => setStudent(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/app/students/${id}`}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isBn ? 'একাডেমিক ভর্তি ও শ্রেণি ইতিহাস' : 'Academic History & Enrollment'}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            ID: {student?.student_id} · {isBn ? student?.name_bn : student?.name_en}
          </p>
        </div>
      </div>

      {/* Profile Summary Card */}
      {student && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-sm font-bold text-slate-900">
              {isBn ? student.name_bn : student.name_en}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {isBn ? 'ভর্তি তারিখ:' : 'Admission Date:'}{' '}
              {new Date(student.admission_date).toLocaleDateString()}
            </div>
          </div>
          <StudentStatusBadge status={student.status} />
        </div>
      )}

      {/* D04 Architecture Handoff Card */}
      <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
          <GraduationCap className="w-7 h-7" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            {isBn ? 'একাডেমিক এনরোলমেন্ট ও শ্রেণি বিন্যাস (D04 মডিউল)' : 'Academic Enrollment & Class Sections (D04)'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isBn
              ? 'শিক্ষার্থীর প্রাথমিক ভর্তি প্রোফাইল ও অভিভাবক সংক্রান্ত তথ্য D03-তে সম্পূর্ণভাবে সংরক্ষিত হয়েছে। ফি পরিশোধ ও চূড়ান্ত ভর্তি সম্পন্ন হওয়ার পর, ডেলিভারেবল D04-এ এই শিক্ষার্থীকে নির্দিষ্ট শিক্ষাবর্ষ, ক্লাস ও সেকশনে এনরোল করা হবে।'
              : 'The student profile and guardian relations are securely established in D03. Following fee settlement, formal academic enrollment into specific academic years, program classes, and sections will take place in Deliverable D04.'}
          </p>
        </div>

        {/* Lifecycle Flow */}
        <div className="pt-4 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
              <div className="font-bold text-[11px] mb-1">ধাপ ১ (D03)</div>
              <div>{isBn ? 'প্রোফাইল নিবন্ধন' : 'Profile Intake'}</div>
              <div className="text-[10px] text-teal-600 mt-1 font-mono">REGISTERED</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="font-bold text-[11px] mb-1">ধাপ ২ (D06/D07)</div>
              <div>{isBn ? 'ভর্তি ফি পরিশোধ' : 'Fee Payment'}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">ACTIVE</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="font-bold text-[11px] mb-1">ধাপ ৩ (D04)</div>
              <div>{isBn ? 'ক্লাস ও সেকশন' : 'Class & Section'}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">ENROLLED</div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link
            to={`/app/students/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isBn ? 'শিক্ষার্থী প্রোফাইলে ফিরে যান' : 'Back to Student Profile'}
          </Link>
        </div>
      </div>
    </div>
  );
};
