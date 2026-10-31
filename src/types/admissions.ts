export type AdmissionEntryType = 'REGULAR' | 'TRANSFER_IN' | 'LATERAL_ENTRY';

export type AdmissionStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EnrollmentStatus =
  | 'DRAFT'
  | 'PENDING_BILLING'
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type EnrollmentType = 'NEW' | 'CONTINUING';

export interface ProgramAdmission {
  id: number;
  student_id: number;
  academic_program_id: number;
  academic_cohort_id: number | null;
  entry_type: AdmissionEntryType;
  status: AdmissionStatus;
  entered_at: string;
  completed_at: string | null;
  lock_version: number;
  program?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    scheme: 'CALENDAR_YEAR' | 'SESSION_BASED';
  };
  cohort?: {
    id: number;
    label: string;
    intake_year: number;
  };
}

export interface EnrollmentStatusEvent {
  id: number;
  enrollment_id: number;
  from_status: string;
  to_status: string;
  reason: string | null;
  actor_id: number;
  source_type: 'USER_ACTION' | 'BILLING_SEAM' | 'PAYMENT_SEAM' | 'SYSTEM';
  source_reference: string | null;
  occurred_at: string;
  actor?: {
    id: number;
    name_bn: string;
    name_en: string;
    username: string;
  };
}

export interface SectionCapacity {
  section_id: number;
  section_code: string;
  section_name_bn: string;
  section_name_en: string;
  capacity: number;
  occupied_seats: number;
  available_seats: number;
  is_full: boolean;
  is_active: boolean;
}

export interface Enrollment {
  id: number;
  program_admission_id: number;
  student_id: number;
  academic_period_id: number;
  academic_offering_id: number;
  offering_section_id: number;
  enrollment_type: EnrollmentType;
  status: EnrollmentStatus;
  billing_cleared: boolean;
  payment_cleared: boolean;
  lock_version: number;
  submitted_at: string;
  approved_at: string | null;
  cancelled_at: string | null;
  student?: {
    id: number;
    student_id: string;
    name_bn: string;
    name_en: string;
    gender: 'MALE' | 'FEMALE';
    status: string;
    primary_guardian?: {
      name_bn: string;
      name_en: string;
      phone: string;
      relation: string;
    };
  };
  program_admission?: ProgramAdmission;
  period?: {
    id: number;
    program_id: number;
    cohort_id: number | null;
    label: string;
    calendar_year?: number;
    study_year_number?: number;
    state: string;
    program?: {
      id: number;
      code: string;
      name_bn: string;
      name_en: string;
      scheme: 'CALENDAR_YEAR' | 'SESSION_BASED';
    };
  };
  offering?: {
    id: number;
    program_class?: {
      id: number;
      code: string;
      name_bn: string;
      name_en: string;
      stage_number: number;
    };
    track?: {
      id: number;
      code: string;
      name_bn: string;
      name_en: string;
    } | null;
  };
  section?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    capacity: number;
  };
  status_events?: EnrollmentStatusEvent[];
}

export interface AdmissionsWorkbenchMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  counts: {
    total: number;
    pending_billing: number;
    pending_payment: number;
    approved: number;
    cancelled: number;
    rejected: number;
  };
}

export interface StudentSearchItem {
  id: number;
  student_id: string;
  name_bn: string;
  name_en: string;
  gender: 'MALE' | 'FEMALE';
  status: string;
  is_active: boolean;
  has_pending_duplicate: boolean;
  primary_guardian: {
    name_bn: string;
    name_en: string;
    phone: string;
    relation: string;
  } | null;
  active_programs: Array<{
    program_id: number;
    program_code: string;
    program_name_bn: string;
    program_name_en: string;
    status: string;
  }>;
  latest_enrollment: {
    id: number;
    status: EnrollmentStatus;
    period_label: string;
    class_name_bn: string;
    class_name_en: string;
    section_code: string;
  } | null;
}

export interface EligibilityResult {
  is_eligible: boolean;
  errors: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
  student: {
    id: number;
    student_id: string;
    name_bn: string;
    name_en: string;
    status: string;
  };
  program: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    scheme: 'CALENDAR_YEAR' | 'SESSION_BASED';
  };
}

export interface ReturningContext {
  student: {
    id: number;
    student_id: string;
    name_bn: string;
    name_en: string;
  };
  previous_enrollment: Enrollment | null;
  current_stage: number;
  suggested_next_stage: number;
  program: any;
  available_periods: any[];
  classes: any[];
  tracks: any[];
}

export interface SessionProgressionContext {
  student: {
    id: number;
    student_id: string;
    name_bn: string;
    name_en: string;
  };
  has_session_program: boolean;
  message?: string;
  program?: any;
  cohort?: any;
  periods_timeline?: any[];
  past_enrollments?: Enrollment[];
  next_period?: any;
}

