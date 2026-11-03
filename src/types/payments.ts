export interface PaymentSlip {
  id: number;
  slip_number: string;
  invoice_id: number;
  student_id: number;
  enrollment_id?: number | null;
  academic_period_id: number;
  status: 'UNPAID' | 'PARTIALLY_COLLECTED' | 'COLLECTED' | 'EXPIRED' | 'VOIDED' | 'SUPERSEDED';
  slip_amount: string;
  collected_amount: string;
  remaining_amount: string;
  expires_at?: string | null;
  verification_token_hash: string;
  snapshot_payload?: any;
  print_count: number;
  last_printed_at?: string | null;
  issued_by: number;
  issued_at: string;
  voided_by?: number | null;
  voided_at?: string | null;
  void_reason?: string | null;
  superseded_by_slip_id?: number | null;
  notes?: string | null;
  student?: {
    id: number;
    student_code: string;
    name_bn: string;
    name_en: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    total_amount: string;
    paid_amount: string;
    balance_amount: string;
    status: string;
    items?: Array<{
      id: number;
      name: string;
      name_bn?: string;
      net_amount: string;
      paid_amount: string;
      balance_amount: string;
      admission_required: boolean;
    }>;
  };
  academic_period?: {
    id: number;
    name: string;
  };
  issuer?: {
    id: number;
    name: string;
  };
}

export interface CashierShift {
  id: number;
  shift_number: string;
  cashier_user_id: number;
  counter_code: string;
  status: 'OPEN' | 'CLOSED' | 'UNDER_REVIEW' | 'RECONCILED';
  opened_at: string;
  closed_at?: string | null;
  opening_float_amount: string;
  expected_cash_amount: string;
  counted_cash_amount?: string | null;
  variance_amount?: string | null;
  denomination_breakdown?: Record<string, number> | null;
  closing_notes?: string | null;
  variance_reason?: string | null;
  reconciled_by?: number | null;
  reconciled_at?: string | null;
  reconciliation_notes?: string | null;
  cashier?: {
    id: number;
    name: string;
  };
  reconciler?: {
    id: number;
    name: string;
  };
}

export interface Payment {
  id: number;
  payment_reference: string;
  payment_slip_id: number;
  invoice_id: number;
  student_id: number;
  enrollment_id?: number | null;
  academic_period_id: number;
  cashier_shift_id: number;
  payment_method: string;
  status: 'POSTED' | 'REVERSED';
  amount_received: string;
  allocated_amount: string;
  cash_tendered_amount: string;
  change_returned_amount: string;
  collected_by: number;
  collected_at: string;
  counter_code?: string | null;
  remarks?: string | null;
  admission_approved_triggered: boolean;
  student?: {
    id: number;
    student_code: string;
    name_bn: string;
    name_en: string;
  };
  receipt?: PaymentReceipt;
  collector?: {
    id: number;
    name: string;
  };
  cashier_shift?: CashierShift;
  allocations?: Array<{
    id: number;
    invoice_item_id: number;
    direction: string;
    allocated_amount: string;
    admission_required: boolean;
    item_balance_before: string;
    item_balance_after: string;
    invoice_item?: {
      name: string;
      name_bn?: string;
    };
  }>;
}

export interface PaymentReceipt {
  id: number;
  receipt_number: string;
  payment_id: number;
  payment_slip_id: number;
  invoice_id: number;
  student_id: number;
  status: 'VALID' | 'REVERSED';
  receipt_amount: string;
  verification_token_hash: string;
  snapshot_payload?: any;
  print_count: number;
  last_printed_at?: string | null;
  last_reprint_reason?: string | null;
  issued_at: string;
  reversed_at?: string | null;
  student?: {
    id: number;
    student_code: string;
    name_bn: string;
    name_en: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
  };
}

export interface PaymentReversalRequest {
  id: number;
  request_number: string;
  payment_id: number;
  invoice_id: number;
  student_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason_category: string;
  reason_details: string;
  requested_by: number;
  requested_at: string;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  payment?: Payment;
  student?: {
    student_code: string;
    name_bn: string;
    name_en: string;
  };
  requester?: {
    id: number;
    name: string;
  };
  reviewer?: {
    id: number;
    name: string;
  };
}

export interface PaymentNotification {
  id: number;
  payment_id: number;
  payment_receipt_id: number;
  student_id: number;
  guardian_id?: number | null;
  channel: string;
  recipient_name?: string | null;
  recipient_phone_masked?: string | null;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SKIPPED_NO_CONSENT' | 'SKIPPED_NO_PHONE';
  template_code: string;
  message_preview?: string | null;
  attempt_count: number;
  max_attempts: number;
  sent_at?: string | null;
  delivered_at?: string | null;
  last_error_code?: string | null;
  last_error_message?: string | null;
  student?: {
    student_code: string;
    name_bn: string;
    name_en: string;
  };
}

export interface PaymentDashboardData {
  metrics: {
    today_collections: string;
    today_receipt_count: number;
    unpaid_slips_count: number;
    active_shifts_count: number;
    pending_reversals_count: number;
    pending_clearances_count: number;
  };
  recent_payments: Payment[];
}
