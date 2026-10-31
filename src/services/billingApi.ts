import { apiClient } from './apiClient';
import type {
  BillingDashboardSummary,
  BillingRun,
  FeeAdjustmentRequest,
  FeeCategory,
  FeeStructure,
  InstallmentPlan,
  Invoice,
  StudentBillingLedger,
} from '../types/billing';

export const billingApi = {
  // Dashboard & Summary
  getSummary: async (): Promise<BillingDashboardSummary> => {
    const res = await apiClient.get('/api/v1/billing/summary');
    return res.data.data;
  },

  // Fee Categories
  listCategories: async (params?: {
    is_active?: boolean;
    billing_type?: string;
    search?: string;
    per_page?: number;
  }): Promise<FeeCategory[]> => {
    const res = await apiClient.get('/api/v1/fee-categories', { params });
    return Array.isArray(res.data.data) ? res.data.data : res.data;
  },

  createCategory: async (data: {
    code: string;
    name_bn: string;
    name_en: string;
    billing_type: string;
    default_cadence: string;
    is_mandatory_default?: boolean;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<FeeCategory> => {
    const res = await apiClient.post('/api/v1/fee-categories', data);
    return res.data.data;
  },

  getCategory: async (id: number): Promise<FeeCategory> => {
    const res = await apiClient.get(`/api/v1/fee-categories/${id}`);
    return res.data.data;
  },

  updateCategory: async (
    id: number,
    data: Partial<{
      code: string;
      name_bn: string;
      name_en: string;
      billing_type: string;
      default_cadence: string;
      is_mandatory_default: boolean;
      is_active: boolean;
      sort_order: number;
    }>
  ): Promise<FeeCategory> => {
    const res = await apiClient.patch(`/api/v1/fee-categories/${id}`, data);
    return res.data.data;
  },

  archiveCategory: async (id: number): Promise<FeeCategory> => {
    const res = await apiClient.post(`/api/v1/fee-categories/${id}/archive`);
    return res.data.data;
  },

  // Fee Structures
  listStructures: async (params?: {
    program_id?: number;
    academic_period_id?: number;
    program_class_id?: number;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: FeeStructure[]; total: number; current_page: number; last_page: number }> => {
    const res = await apiClient.get('/api/v1/fee-structures', { params });
    return res.data;
  },

  createStructure: async (data: {
    code: string;
    name_bn: string;
    name_en: string;
    program_id: number;
    academic_period_id: number;
    program_class_id: number;
    effective_from: string;
    effective_to?: string | null;
    notes?: string | null;
    items: Array<{
      fee_category_id: number;
      amount: string;
      cadence: string;
      is_mandatory: boolean;
      applies_on_admission: boolean;
      applies_on_promotion: boolean;
      applies_monthly: boolean;
      due_day_of_month?: number | null;
      sort_order?: number;
    }>;
  }): Promise<FeeStructure> => {
    const res = await apiClient.post('/api/v1/fee-structures', data);
    return res.data.data;
  },

  getStructure: async (id: number): Promise<FeeStructure> => {
    const res = await apiClient.get(`/api/v1/fee-structures/${id}`);
    return res.data.data;
  },

  updateStructure: async (
    id: number,
    data: {
      lock_version: number;
      name_bn?: string;
      name_en?: string;
      effective_from?: string;
      effective_to?: string | null;
      notes?: string | null;
      items?: Array<{
        fee_category_id: number;
        amount: string;
        cadence: string;
        is_mandatory: boolean;
        applies_on_admission: boolean;
        applies_on_promotion: boolean;
        applies_monthly: boolean;
        due_day_of_month?: number | null;
        sort_order?: number;
      }>;
    }
  ): Promise<FeeStructure> => {
    const res = await apiClient.patch(`/api/v1/fee-structures/${id}`, data);
    return res.data.data;
  },

  publishStructure: async (id: number, lockVersion: number): Promise<FeeStructure> => {
    const res = await apiClient.post(`/api/v1/fee-structures/${id}/publish`, {
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  cloneStructure: async (
    id: number,
    data?: { effective_from?: string; effective_to?: string | null; notes?: string }
  ): Promise<FeeStructure> => {
    const res = await apiClient.post(`/api/v1/fee-structures/${id}/clone-version`, data || {});
    return res.data.data;
  },

  archiveStructure: async (id: number, lockVersion: number): Promise<FeeStructure> => {
    const res = await apiClient.post(`/api/v1/fee-structures/${id}/archive`, {
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  // Billing Runs
  listRuns: async (params?: {
    type?: string;
    status?: string;
    academic_period_id?: number;
    program_class_id?: number;
    billing_month?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: BillingRun[]; total: number; current_page: number; last_page: number }> => {
    const res = await apiClient.get('/api/v1/billing-runs', { params });
    return res.data;
  },

  previewRun: async (data: {
    type: string;
    academic_period_id: number;
    program_class_id?: number | null;
    offering_section_id?: number | null;
    billing_month?: string | null;
    due_date: string;
  }): Promise<{
    type: string;
    academic_period_id: number;
    program_class_id: number | null;
    offering_section_id: number | null;
    billing_month: string | null;
    due_date: string;
    target_student_count: number;
    billable_count: number;
    skipped_existing_count: number;
    failed_count: number;
    estimated_total_amount: string;
    items: Array<{
      enrollment_id: number;
      student_id: number;
      student_code: string | null;
      student_name_bn: string | null;
      student_name_en: string | null;
      program_class_id: number;
      status: string;
      expected_amount: string;
      invoice_id: number | null;
      failure_code: string | null;
      failure_reason: string | null;
    }>;
  }> => {
    const res = await apiClient.post('/api/v1/billing-runs/preview', data);
    return res.data.data;
  },

  createRun: async (
    data: {
      type: string;
      academic_period_id: number;
      program_class_id?: number | null;
      offering_section_id?: number | null;
      billing_month?: string | null;
      due_date: string;
      notes?: string | null;
    },
    idempotencyKey?: string
  ): Promise<BillingRun> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const res = await apiClient.post('/api/v1/billing-runs', data, { headers });
    return res.data.data;
  },

  getRun: async (id: number): Promise<BillingRun> => {
    const res = await apiClient.get(`/api/v1/billing-runs/${id}`);
    return res.data.data;
  },

  executeRun: async (
    id: number,
    data?: { issue_immediately?: boolean; lock_version?: number },
    idempotencyKey?: string
  ): Promise<BillingRun> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const res = await apiClient.post(`/api/v1/billing-runs/${id}/execute`, data || {}, { headers });
    return res.data.data;
  },

  retryFailedRunItems: async (
    id: number,
    data?: { issue_immediately?: boolean; lock_version?: number }
  ): Promise<BillingRun> => {
    const res = await apiClient.post(`/api/v1/billing-runs/${id}/retry-failed`, data || {});
    return res.data.data;
  },

  cancelRun: async (id: number, lockVersion?: number): Promise<BillingRun> => {
    const res = await apiClient.post(`/api/v1/billing-runs/${id}/cancel`, {
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  // Invoices
  listInvoices: async (params?: {
    student_id?: number;
    enrollment_id?: number;
    academic_period_id?: number;
    program_class_id?: number;
    status?: string;
    source_type?: string;
    billing_month?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: Invoice[]; total: number; current_page: number; last_page: number }> => {
    const res = await apiClient.get('/api/v1/invoices', { params });
    return res.data;
  },

  previewInvoice: async (data: {
    enrollment_id: number;
    source_type?: string;
    billing_month?: string | null;
    due_date?: string | null;
    items?: Array<{
      fee_category_id: number;
      description_bn?: string;
      description_en?: string;
      quantity?: number;
      unit_amount: string;
    }>;
  }): Promise<any> => {
    const res = await apiClient.post('/api/v1/invoices/preview', data);
    return res.data.data;
  },

  createInvoice: async (
    data: {
      enrollment_id: number;
      source_type?: string;
      source_reference?: string;
      billing_month?: string | null;
      due_date?: string | null;
      issue_immediately?: boolean;
      notes?: string | null;
      items?: Array<{
        fee_category_id: number;
        description_bn?: string;
        description_en?: string;
        quantity?: number;
        unit_amount: string;
      }>;
    },
    idempotencyKey?: string
  ): Promise<Invoice> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const res = await apiClient.post('/api/v1/invoices', data, { headers });
    return res.data.data;
  },

  getInvoice: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get(`/api/v1/invoices/${id}`);
    return res.data.data;
  },

  issueInvoice: async (id: number, lockVersion?: number, idempotencyKey?: string): Promise<Invoice> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const res = await apiClient.post(
      `/api/v1/invoices/${id}/issue`,
      { lock_version: lockVersion },
      { headers }
    );
    return res.data.data;
  },

  voidInvoice: async (id: number, reason: string, lockVersion?: number): Promise<Invoice> => {
    const res = await apiClient.post(`/api/v1/invoices/${id}/void`, {
      reason,
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  // Installment Plans
  getInstallmentPlan: async (
    invoiceId: number
  ): Promise<{ invoice: Invoice; active_plan: InstallmentPlan | null; history: InstallmentPlan[] }> => {
    const res = await apiClient.get(`/api/v1/invoices/${invoiceId}/installment-plan`);
    return res.data.data;
  },

  replaceInstallmentPlan: async (
    invoiceId: number,
    items: Array<{ due_date: string; amount: string; notes?: string | null }>
  ): Promise<InstallmentPlan> => {
    const res = await apiClient.put(`/api/v1/invoices/${invoiceId}/installment-plan`, { items });
    return res.data.data;
  },

  // Fee Adjustments & Waivers
  listAdjustmentRequests: async (params?: {
    state?: string;
    adjustment_type?: string;
    invoice_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: FeeAdjustmentRequest[];
    total: number;
    current_page: number;
    last_page: number;
  }> => {
    const res = await apiClient.get('/api/v1/adjustment-requests', { params });
    return res.data;
  },

  createAdjustmentRequest: async (data: {
    invoice_id: number;
    invoice_item_id: number;
    adjustment_type: string;
    requested_amount: string;
    reason: string;
  }): Promise<FeeAdjustmentRequest> => {
    const res = await apiClient.post('/api/v1/adjustment-requests', data);
    return res.data.data;
  },

  approveAdjustmentRequest: async (
    id: number,
    data?: { review_notes?: string; lock_version?: number }
  ): Promise<FeeAdjustmentRequest> => {
    const res = await apiClient.post(`/api/v1/adjustment-requests/${id}/approve`, data || {});
    return res.data.data;
  },

  rejectAdjustmentRequest: async (
    id: number,
    reviewNotes: string,
    lockVersion?: number
  ): Promise<FeeAdjustmentRequest> => {
    const res = await apiClient.post(`/api/v1/adjustment-requests/${id}/reject`, {
      review_notes: reviewNotes,
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  cancelAdjustmentRequest: async (id: number, lockVersion?: number): Promise<FeeAdjustmentRequest> => {
    const res = await apiClient.post(`/api/v1/adjustment-requests/${id}/cancel`, {
      lock_version: lockVersion,
    });
    return res.data.data;
  },

  // Student Billing Ledger
  getStudentLedger: async (studentId: number): Promise<StudentBillingLedger> => {
    const res = await apiClient.get(`/api/v1/students/${studentId}/billing-ledger`);
    return res.data.data;
  },

  getStudentLedgerSummary: async (studentId: number): Promise<StudentBillingLedger['summary']> => {
    const res = await apiClient.get(`/api/v1/students/${studentId}/billing-summary`);
    return res.data.data;
  },
};

