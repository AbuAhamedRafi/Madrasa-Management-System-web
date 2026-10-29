export type AcademicScheme = 'CALENDAR_YEAR' | 'SESSION_BASED';
export type ProgramState = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type CohortStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type PeriodState = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface InstitutionProfile {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  logo_url: string | null;
  default_locale: 'bn-BD' | 'en';
  timezone: string;
  updated_at?: string;
}

export interface EducationAuthority {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  is_active: boolean;
  sort_order: number;
  levels_count?: number;
  levels?: EducationLevel[];
}

export interface EducationLevel {
  id: number;
  authority_id: number;
  code: string;
  name_bn: string;
  name_en: string;
  is_active: boolean;
  sort_order: number;
  authority?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
  } | null;
}

export interface Department {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  sort_order: number;
  is_active: boolean;
  programs_count?: number;
}

export interface AcademicProgram {
  id: number;
  code: string;
  department_id: number;
  education_level_id: number;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  scheme: AcademicScheme;
  duration_years: number;
  state: ProgramState;
  has_dependencies?: boolean;
  department?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
  } | null;
  education_level?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    authority?: {
      id: number;
      code: string;
      name_bn: string;
      name_en: string;
    } | null;
  } | null;
  classes?: ProgramClass[];
  tracks?: AcademicTrack[];
  cohorts?: AcademicCohort[];
  periods?: AcademicPeriod[];
}

export interface ProgramClass {
  id: number;
  program_id: number;
  code: string;
  name_bn: string;
  name_en: string;
  stage_number: number;
  sort_order: number;
  is_active: boolean;
}

export interface AcademicTrack {
  id: number;
  program_id: number;
  code: string;
  name_bn: string;
  name_en: string;
  is_active: boolean;
}

export interface AcademicCohort {
  id: number;
  program_id: number;
  label: string;
  intake_year: number;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CohortStatus;
  periods_count?: number;
  periods?: AcademicPeriod[];
}

export interface AuditHistoryItem {
  id: string;
  action_code: string;
  actor_name: string;
  actor_name_bn: string;
  before_metadata: Record<string, unknown> | null;
  after_metadata: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface AcademicPeriod {
  id: number;
  program_id: number;
  cohort_id: number | null;
  label: string;
  calendar_year: number | null;
  study_year_number: number | null;
  start_date: string;
  end_date: string;
  state: PeriodState;
  lock_version: number;
  updated_at?: string;
  program?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    scheme: AcademicScheme;
  } | null;
  cohort?: {
    id: number;
    label: string;
    intake_year: number;
    status: CohortStatus;
  } | null;
  offerings?: Array<{
    id: number;
    program_class_id: number;
    academic_track_id: number | null;
    class_name_bn: string | null;
    class_name_en: string | null;
    track_name_bn: string | null;
    track_name_en: string | null;
    is_active: boolean;
    sections_count: number;
  }>;
  audit_history?: AuditHistoryItem[];
}

export interface OfferingSection {
  id: number;
  academic_offering_id: number;
  offering_id: number;
  code: string;
  name_bn: string;
  name_en: string;
  capacity: number;
  is_active: boolean;
}

export interface AcademicOffering {
  id: number;
  academic_period_id: number;
  program_class_id: number;
  academic_track_id: number | null;
  is_active: boolean;
  program_class?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    stage_number: number;
  } | null;
  track?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
  } | null;
  sections: OfferingSection[];
}

export interface AcademicSummary {
  active_departments_count: number;
  programs_count: number;
  active_programs_count: number;
  open_periods_count: number;
  total_periods_count: number;
  classes_count: number;
  sections_count: number;
  total_configured_seats: number;
}

export interface HierarchyAuthorityNode {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  is_active: boolean;
  levels: Array<{
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    is_active: boolean;
    departments: Array<{
      id: number;
      code: string;
      name_bn: string;
      name_en: string;
      is_active: boolean;
      programs: AcademicProgram[];
    }>;
  }>;
}

