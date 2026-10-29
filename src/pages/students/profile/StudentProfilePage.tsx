import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentsApi } from '../../../services/studentsApi';
import type { Student } from '../../../types/students';
import { StudentStatusBadge } from '../../../components/students/StudentStatusBadge';
import { StatusChangeModal } from './components/StatusChangeModal';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  Shield,
  FileText,
  Bookmark,
  GraduationCap,
  History,
  Edit,
  Copy,
  Check,
  Phone,
  Calendar,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isBn = i18n.language.startsWith('bn');
  const { hasPermission } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'personal' | 'guardians' | 'documents' | 'identifiers' | 'academic' | 'audit'
  >('personal');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const canEdit = hasPermission('students.update');
  const canManageStatus = hasPermission('students.manage_status');

  const loadStudent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await studentsApi.getStudent(Number(id));
      setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  const copyStudentId = () => {
    if (student?.student_id) {
      navigator.clipboard.writeText(student.student_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        {isBn ? 'শিক্ষার্থীর তথ্য লোড হচ্ছে...' : 'Loading student profile...'}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-rose-500">
        {isBn ? 'শিক্ষার্থী পাওয়া যায়নি।' : 'Student not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500">
        <Link to="/app/students" className="hover:underline">
          {isBn ? 'শিক্ষার্থী তালিকা' : 'Student Directory'}
        </Link>{' '}
        / <span className="font-semibold text-slate-800">{student.name_bn}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#137C73]/10 text-[#137C73] font-bold text-2xl flex items-center justify-center shrink-0 border border-[#137C73]/20 shadow-xs">
            {student.name_bn.charAt(0) || student.name_en.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{student.name_bn}</h1>
              <StudentStatusBadge status={student.status} />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{student.name_en}</div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                <span>ID: {student.student_id}</span>
                <button
                  type="button"
                  onClick={copyStudentId}
                  title="Copy Student ID"
                  className="text-slate-400 hover:text-slate-700 ml-1"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isBn ? 'ভর্তি:' : 'Admitted:'} {student.admission_date}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canEdit && student.status !== 'ARCHIVED' && (
            <Link
              to={`/app/students/${student.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}</span>
            </Link>
          )}

          {canManageStatus && student.status !== 'ARCHIVED' && (
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#137C73] text-white text-xs font-bold hover:bg-[#0f635c] transition-colors shadow-2xs"
            >
              <span>{isBn ? 'অবস্থা পরিবর্তন (Status)' : 'Change Status'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'personal'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Details'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guardians')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'guardians'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>
            {isBn ? 'অভিভাবকবৃন্দ' : 'Guardians'} ({student.guardians?.length || 0})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'documents'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isBn ? 'নথিপত্র (Documents)' : 'Documents'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identifiers')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'identifiers'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>
            {isBn ? 'বোর্ড / রোল নম্বর' : 'Identifiers'} ({student.identifiers?.length || 0})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'academic'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isBn ? 'একাডেমিক ইতিহাস' : 'Academic History'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-[#137C73] text-[#137C73]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isBn ? 'অডিট লগ' : 'Audit Trail'}</span>
        </button>
      </div>

      {/* TAB 1: Personal Details */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              {isBn ? 'মৌলিক তথ্য' : 'Identity Information'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">{isBn ? 'নাম (বাংলা):' : 'Name (Bangla):'}</span>
                <span className="font-semibold text-slate-900">{student.name_bn}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'নাম (ইংরেজি):' : 'Name (English):'}</span>
                <span className="font-semibold text-slate-900 font-mono">{student.name_en}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'জন্মতারিখ:' : 'Date of Birth:'}</span>
                <span className="font-semibold text-slate-900 font-mono">{student.date_of_birth}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'লিঙ্গ:' : 'Gender:'}</span>
                <span className="font-semibold text-slate-900">{student.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'ভর্তির তারিখ:' : 'Admission Date:'}</span>
                <span className="font-semibold text-slate-900 font-mono">{student.admission_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {isBn ? 'জন্ম নিবন্ধন নম্বর (BRC):' : 'Birth Reg Number:'}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {student.birth_registration_number || '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              {isBn ? 'ঠিকানা ও অবস্থান' : 'Address Details'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">{isBn ? 'বর্তমান ঠিকানা:' : 'Present Address:'}</span>
                <span className="text-slate-800">{student.present_address_bn || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'স্থায়ী ঠিকানা:' : 'Permanent Address:'}</span>
                <span className="text-slate-800">{student.permanent_address_bn || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Guardians */}
      {activeTab === 'guardians' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'সংযুক্ত অভিভাবকবৃন্দ' : 'Linked Guardians'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'প্রাইমারি অভিভাবক মাদ্রাসা নোটিশ ও জরুরি যোগাযোগের প্রধান মাধ্যম।'
                  : 'Primary guardian is the primary recipient of SMS notices and receipts.'}
              </p>
            </div>
            <Link
              to={`/app/students/${student.id}/guardians`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100"
            >
              <span>{isBn ? 'অভিভাবক পরিচালনা →' : 'Manage Guardians →'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.guardians?.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{g.name_bn}</span>
                    {g.is_primary && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                        {isBn ? '★ প্রাইমারি অভিভাবক' : '★ Primary'}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">{g.name_en}</div>
                  <div className="text-slate-600 mt-2">
                    {isBn ? 'সম্পর্ক:' : 'Relation:'} <strong className="text-slate-800">{g.relation}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{g.phone}</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      g.sms_consent ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {g.sms_consent ? 'SMS Consent: YES' : 'SMS: NO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Documents Shortcut */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'সংযুক্ত নথিপত্র' : 'Private Stored Documents'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'জন্ম সনদ, পূর্ববর্তী প্রশংসাপত্র ও জাতীয় পরিচয়পত্রের কপি।'
                  : 'Birth certificates, previous transcripts, and NID copies.'}
              </p>
            </div>
            <Link
              to={`/app/students/${student.id}/documents`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#137C73] text-white text-xs font-semibold hover:bg-[#0f635c]"
            >
              <span>{isBn ? 'ডকুমেন্ট আপলোড ও পরিচালনা →' : 'Manage Documents →'}</span>
            </Link>
          </div>
          <div className="text-xs text-slate-500">
            {isBn
              ? 'নিরাপত্তা নিশ্চিত করতে ফাইলগুলো এনক্রিপ্টযুক্ত প্রাইভেট স্টোরেজে সংরক্ষিত।'
              : 'Files are safely secured in private disk storage with authenticated streaming.'}
          </div>
        </div>
      )}

      {/* TAB 4: Identifiers */}
      {activeTab === 'identifiers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            {isBn ? 'বোর্ড ও বাহ্যিক পরিচিতি নম্বর' : 'External & Legacy Identifiers'}
          </h3>
          {student.identifiers && student.identifiers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {student.identifiers.map((ident) => (
                <div key={ident.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{ident.value_raw}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({ident.namespace})</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{ident.issuer || '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              {isBn ? 'কোনো বাহ্যিক পরিচিতি যুক্ত করা হয়নি।' : 'No external identifiers recorded.'}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Academic History Handoff (UI-07) */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900">
              {isBn ? 'কোনো একাডেমিক এনরোলমেন্ট নেই' : 'No Academic Enrollment Records Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'শিক্ষার্থীর পরিচিতি ও প্রোফাইল সফলভাবে তৈরি হয়েছে। শ্রেণি, সেশন ও শাখা বরাদ্দ ডেলিভারেবল D04-এর মাধ্যমে সম্পন্ন হবে।'
                : 'Student identity is established. Program class, study period and section assignment will be handled via Deliverable D04 Academic Admissions.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 max-w-sm mx-auto text-[11px] text-slate-600 font-mono">
            D04 Admission Handoff Seam: Awaiting Academic Intake
          </div>
        </div>
      )}

      {/* TAB 6: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            {isBn ? 'অডিট ও নিরাপত্তা লগ' : 'Audit Trail & Change History'}
          </h3>
          <div className="space-y-3">
            {student.audit_history?.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-slate-800">{log.action_code}</div>
                  <div className="text-slate-600 mt-0.5">{log.reason || '—'}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'সম্পাদনকারী:' : 'Actor:'} {log.actor?.name_bn || log.actor?.username || 'System'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Modal */}
      <StatusChangeModal
        studentId={student.id}
        currentStatus={student.status}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdated={loadStudent}
      />
    </div>
  );
};
