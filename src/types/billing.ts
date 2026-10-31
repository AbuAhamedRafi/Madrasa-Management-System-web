export type FeeBillingType = 'ONE_TIME' | 'RECURRING' | 'EVENT_BASED';
export type FeeCadence = 'ONCE' | 'MONTHLY' | 'TERM' | 'ANNUAL' | 'AD_HOC';
export type FeeStructureStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'VOIDED';
export type InvoiceSourceType = 'ADMISSION' | 'PROMOTION' | 'MONTHLY_RUN' | 'MANUAL';
export type BillingRunType = 'ADMISSION_BATCH' | 'MONTHLY_TUITION' | 'PROMOTION_BATCH';
export type BillingRunStatus =
  | 'DRAFT'
  | 'PREVIEWED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'PARTIALLY_FAILED'
  | 'CANCELLED';
export type BillingRunItemStatus = 'PENDING' | 'ISSUED' | 'SKIPPED_EXISTING' | 'FAILED';
export type InstallmentPlanStatus = 'ACTIVE' | 'SUPERSEDED' | 'VOIDED';
export type AdjustmentType = 'WAIVER' | 'DISCOUNT' | 'SCHOLARSHIP';
export type AdjustmentState = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface FeeCategory {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  billing_type: FeeBillingType;
  default_cadence: FeeCadence;
  is_mandatory_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureItem {
  id?: number;
  fee_structure_id?: number;
  fee_category_id: number;
  amount: string;
  cadence: FeeCadence;
  is_mandatory: boolean;
  applies_on_admission: boolean;
  applies_on_promotion: boolean;
  applies_monthly: boolean;
  due_day_of_month?: number | null;
  sort_order?: number;
  category?: FeeCategory;
}

export interface FeeStructure {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  program_id: number;
  academic_period_id: number;
  program_class_id: number;
  version_no: number;
  status: FeeStructureStatus;
  effective_from: string;
  effective_to: string | null;
  published_at: string | null;
  published_by: number | null;
  supersedes_structure_id: number | null;
  lock_version: number;
  notes: string | null;
  items?: FeeStructureItem[];
  program?: { id: number; code?: string; name_en: string; name_bn: string };
  period?: { id: number; code?: string; name_en?: string; name_bn?: string; label?: string };
  program_class?: { id: number; code?: string; name_en: string; name_bn: string; stage_number?: number };
  publisher?: { id: number; name_en?: string; name_bn?: string; full_name_en?: string; full_name_bn?: string };
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  fee_category_id: number;
  description_bn: string;
  description_en: string;
  quantity: number;
  unit_amount: string;
  gross_amount: string;
  adjustment_amount: string;
  net_amount: string;
  category?: FeeCategory;
  adjustments?: FeeAdjustment[];
  adjustment_requests?: FeeAdjustmentRequest[];
}

export interface InstallmentScheduleItem {
  id?: number;
  installment_plan_id?: number;
  installment_no: number;
  due_date: string;
  amount: string;
  notes?: string | null;
}

export interface InstallmentPlan {
  id: number;
  invoice_id: number;
  version_no: number;
  status: InstallmentPlanStatus;
  total_scheduled_amount: string;
  created_by: number;
  approved_by: number | null;
  items?: InstallmentScheduleItem[];
  creator?: { id: number; full_name_en?: string; full_name_bn?: string };
  created_at: string;
}

export interface FeeAdjustmentRequest {
  id: number;
  invoice_id: number;
  invoice_item_id: number;
  adjustment_type: AdjustmentType;
  requested_amount: string;
  reason: string;
  state: AdjustmentState;
  requested_by: number;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  lock_version: number;
  created_at: string;
  invoice?: Invoice;
  invoice_item?: InvoiceItem;
  requester?: { id: number; full_name_en?: string; full_name_bn?: string; username?: string };
  reviewer?: { id: number; full_name_en?: string; full_name_bn?: string; username?: string };
  applied_adjustment?: FeeAdjustment;
}

export interface FeeAdjustment {
  id: number;
  adjustment_request_id: number;
  invoice_id: number;
  invoice_item_id: number;
  adjustment_type: AdjustmentType;
  applied_amount: string;
  applied_by: number;
  applied_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  student_id: number;
  enrollment_id: number;
  academic_period_id: number;
  program_class_id: number;
  offering_section_id: number | null;
  fee_structure_id: number | null;
  source_type: InvoiceSourceType;
  source_reference: string;
  billing_month: string | null;
  issue_date: string | null;
  due_date: string;
  status: InvoiceStatus;
  subtotal_amount: string;
  adjustment_total_amount: string;
  net_payable_amount: string;
  currency: string;
  issued_by: number | null;
  issued_at: string | null;
  voided_by: number | null;
  voided_at: string | null;
  void_reason: string | null;
  lock_version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    student_id: string;
    full_name_en: string;
    full_name_bn: string;
  };
  enrollment?: {
    id: number;
    enrollment_status: string;
    roll_number?: number | null;
  };
  period?: { id: number; code?: string; name_en?: string; name_bn?: string };
  program_class?: { id: number; code?: string; name_en: string; name_bn: string };
  section?: { id: number; code?: string; name_en: string; name_bn: string };
  fee_structure?: FeeStructure;
  items?: InvoiceItem[];
  active_installment_plan?: InstallmentPlan | null;
  installment_plans?: InstallmentPlan[];
  adjustment_requests?: FeeAdjustmentRequest[];
  adjustments?: FeeAdjustment[];
}

export interface BillingRunItem {
  id: number;
  billing_run_id: number;
  student_id: number;
  enrollment_id: number;
  invoice_id: number | null;
  status: BillingRunItemStatus;
  expected_amount: string;
  failure_code: string | null;
  failure_Reason?: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  student?: {
    id: number;
    student_id: string;
    full_name_en: string;
    full_name_bn: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    status: InvoiceStatus;
    net_payable_amount: string;
  };
}

export interface BillingRun {
  id: number;
  run_code: string;
  type: BillingRunType;
  academic_period_id: number;
  program_class_id: number | null;
  offering_section_id: number | null;
  billing_month: string | null;
  due_date: string;
  status: BillingRunStatus;
  target_student_count: number;
  processed_count: number;
  success_count: number;
  skipped_count: number;
  failed_count: number;
  total_invoiced_amount: string;
  initiated_by: number;
  executed_at: string | null;
  completed_at: string | null;
  lock_version: number;
  notes: string | null;
  created_at: string;
  period?: { id: number; code?: string; name_en?: string; name_bn?: string };
  program_class?: { id: number; code?: string; name_en: string; name_bn: string };
  section?: { id: number; code?: string; name_en: string; name_bn: string };
  initiator?: { id: number; full_name_en?: string; full_name_bn?: string };
  items?: BillingRunItem[];
}

export interface BillingDashboardSummary {
  kpis: {
    issued_this_month_amount: string;
    issued_this_month_count: number;
    pending_admission_invoices_count: number;
    pending_adjustment_requests_count: number;
    published_fee_structures_count: number;
    draft_invoices_count: number;
  };
  recent_runs: BillingRun[];
  recent_invoices: Invoice[];
}

export interface StudentBillingLedger {
  student: {
    id: number;
    student_id: string;
    full_name_bn: string;
    full_name_en: string;
    status: string;
  };
  summary: {
    total_gross_billed: string;
    total_adjustments_applied: string;
    total_net_billed: string;
    issued_invoices_count: number;
    draft_invoices_count: number;
    voided_invoices_count: number;
    pending_adjustment_requests_count: number;
    currency: string;
    d07_payment_settlement_status: string;
  };
  entries: Array<{
    invoice_id: number;
    invoice_number: string;
    source_type: InvoiceSourceType;
    source_reference: string;
    billing_month: string | null;
    issue_date: string | null;
    due_date: string | null;
    status: InvoiceStatus;
    period_name_bn: string | null;
    period_name_en: string | null;
    class_name_bn: string | null;
    class_name_en: string | null;
    section_name_bn: string | null;
    section_name_en: string | null;
    subtotal_amount: string;
    adjustment_total_amount: string;
    net_payable_amount: string;
    has_active_installment_plan: boolean;
    installment_count: number;
    items_count: number;
  }>;
}
