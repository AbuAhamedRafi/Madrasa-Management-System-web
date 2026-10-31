export type PromotionAction = 'PROMOTE' | 'REPEAT';
export type PromotionBatchMode = 'INDIVIDUAL' | 'BULK';
export type PromotionBatchStatus =
  | 'DRAFT'
  | 'PREVIEWED'
  | 'QUEUED'
  | 'RUNNING'
  | 'PAUSING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'CANCELLED';

export type PromotionItemStatus =
  | 'PENDING'
  | 'ELIGIBLE'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'SKIPPED'
  | 'RETRY_QUEUED';

export interface PromotionBatch {
  id: number;
  batch_number: string;
  mode: PromotionBatchMode;
  action: PromotionAction;
  source_academic_period_id: number;
  source_offering_section_id: number | null;
  target_academic_period_id: number;
  target_academic_offering_id: number;
  status: PromotionBatchStatus;
  lock_version: number;
  notes: string | null;
  created_by: number;
  submitted_by: number | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  total_items?: number;
  eligible_items?: number;
  succeeded_items?: number;
  failed_items?: number;
  pending_items?: number;
  source_academic_period?: {
    id: number;
    label: string;
    calendar_year?: number;
    program?: { id: number; name_en: string; name_bn: string };
  };
  source_offering_section?: {
    id: number;
    code: string;
    name_bn: string;
    name_en: string;
    offering?: { program_class?: { name_en: string; name_bn: string } };
  };
  target_academic_period?: {
    id: number;
    label: string;
    calendar_year?: number;
    state?: string;
    program?: { id: number; name_en: string; name_bn: string };
  };
  target_academic_offering?: {
    id: number;
    program_class?: { id: number; name_en: string; name_bn: string; stage_number: number };
    sections?: Array<{ id: number; code: string; name_en: string; name_bn: string; capacity: number }>;
  };
  creator?: { id: number; name_en: string; name_bn: string };
  submitter?: { id: number; name_en: string; name_bn: string };
}

export interface PromotionItem {
  id: number;
  batch_id: number;
  student_id: number;
  source_enrollment_id: number;
  target_offering_section_id: number;
  action: PromotionAction;
  academic_eligibility_confirmed: boolean;
  status: PromotionItemStatus;
  target_enrollment_id: number | null;
  error_code: string | null;
  safe_error_message: string | null;
  attempt_count: number;
  created_at: string;
  student?: {
    id: number;
    student_id: string;
    name_en: string;
    name_bn: string;
    status: string;
  };
  source_enrollment?: {
    id: number;
    period?: { label: string };
    offering?: { program_class?: { name_en: string; name_bn: string; stage_number: number } };
    section?: { code: string; name_en: string; name_bn: string };
  };
  target_offering_section?: {
    id: number;
    code: string;
    name_en: string;
    name_bn: string;
    capacity: number;
    offering?: { program_class?: { name_en: string; name_bn: string; stage_number: number } };
  };
}

export interface PromotionEligibilityResult {
  is_eligible: boolean;
  action: string;
  student: {
    id: number;
    student_id: string;
    name_en: string;
    name_bn: string;
    status: string;
  };
  source_enrollment: {
    id: number;
    status: string;
    period_label?: string;
    program_name?: string;
    class_name?: string;
    stage_number?: number;
    section_code?: string;
  } | null;
  target_period: {
    id: number;
    label: string;
    state: string;
  } | null;
  target_offering_section: {
    id: number;
    code: string;
    capacity: number;
    class_name?: string;
    stage_number?: number;
  } | null;
  academic_eligibility_confirmed: boolean;
  errors: Array<{ code: string; message: string; details?: any }>;
  warnings: Array<{ code: string; message: string }>;
}

export interface PromotionAttempt {
  id: number;
  promotion_item_id: number;
  attempt_number: number;
  idempotency_key: string;
  status: 'STARTED' | 'SUCCEEDED' | 'FAILED';
  started_at: string;
  finished_at: string | null;
  error_code: string | null;
  result_json: any;
  created_at: string;
}

export interface PromotionEvent {
  id: number;
  promotion_batch_id: number;
  promotion_item_id: number | null;
  actor_user_id: number | null;
  action: string;
  before_json: any;
  after_json: any;
  reason: string | null;
  occurred_at: string;
  actor?: { id: number; name_en: string; name_bn: string; username: string };
}

