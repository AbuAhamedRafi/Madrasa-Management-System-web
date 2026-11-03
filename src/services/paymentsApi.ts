import { apiClient } from './api';
import type {
  PaymentSlip,
  CashierShift,
  Payment,
  PaymentReceipt,
  PaymentReversalRequest,
  PaymentNotification,
  PaymentDashboardData,
} from '../types/payments';

export const paymentsApi = {
  // Dashboard
  getDashboard: async (): Promise<PaymentDashboardData> => {
    const res = await apiClient.get<{ success: boolean; data: PaymentDashboardData }>('/payments/dashboard');
    return res.data.data;
  },

  // Payment Slips
  getSlips: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{ success: boolean; data: PaymentSlip[]; meta: any }>('/payment-slips', { params });
    return res.data;
  },

  getSlip: async (id: number): Promise<PaymentSlip> => {
    const res = await apiClient.get<{ success: boolean; data: PaymentSlip }>(`/payment-slips/${id}`);
    return res.data.data;
  },

  lookupSlip: async (slipNumber: string): Promise<PaymentSlip> => {
    const res = await apiClient.get<{ success: boolean; data: PaymentSlip }>(`/payment-slips/lookup/${slipNumber}`);
    return res.data.data;
  },

  createSlip: async (payload: {
    invoice_id: number;
    slip_amount?: number;
    expires_at?: string;
    notes?: string;
    supersede_existing?: boolean;
  }): Promise<PaymentSlip> => {
    const res = await apiClient.post<{ success: boolean; data: PaymentSlip }>('/payment-slips', payload);
    return res.data.data;
  },

  voidSlip: async (id: number, reason: string): Promise<PaymentSlip> => {
    const res = await apiClient.post<{ success: boolean; data: PaymentSlip }>(`/payment-slips/${id}/void`, { reason });
    return res.data.data;
  },

  getSlipPrintPayload: async (id: number): Promise<any> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/payment-slips/${id}/print`);
    return res.data.data;
  },

  // Cash Collection
  collectCash: async (slipId: number, payload: {
    amount_received?: number;
    cash_tendered_amount?: number;
    remarks?: string;
    idempotency_key?: string;
  }): Promise<any> => {
    const res = await apiClient.post<any>(`/payment-slips/${slipId}/collect-cash`, payload);
    return res.data;
  },

  // Payments & Receipts
  getPayments: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{ success: boolean; data: Payment[]; meta: any }>('/payments', { params });
    return res.data;
  },

  getPayment: async (id: number): Promise<Payment> => {
    const res = await apiClient.get<{ success: boolean; data: Payment }>(`/payments/${id}`);
    return res.data.data;
  },

  getReceipt: async (id: number): Promise<PaymentReceipt> => {
    const res = await apiClient.get<{ success: boolean; data: PaymentReceipt }>(`/payment-receipts/${id}`);
    return res.data.data;
  },

  getReceiptPrintPayload: async (id: number): Promise<any> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/payment-receipts/${id}/print`);
    return res.data.data;
  },

  reprintReceipt: async (id: number, reason: string): Promise<PaymentReceipt> => {
    const res = await apiClient.post<{ success: boolean; data: PaymentReceipt }>(`/payment-receipts/${id}/reprint`, { reason });
    return res.data.data;
  },

  // Cashier Shifts
  getCashierShifts: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{ success: boolean; data: CashierShift[]; meta: any }>('/cashier-shifts', { params });
    return res.data;
  },

  openCashierShift: async (payload: { opening_float_amount?: number; counter_code?: string }): Promise<CashierShift> => {
    const res = await apiClient.post<{ success: boolean; data: CashierShift }>('/cashier-shifts/open', payload);
    return res.data.data;
  },

  closeCashierShift: async (shiftId: number, payload: {
    counted_cash_amount: number;
    denomination_breakdown?: Record<string, number>;
    variance_reason?: string;
    closing_notes?: string;
  }): Promise<CashierShift> => {
    const res = await apiClient.post<{ success: boolean; data: CashierShift }>(`/cashier-shifts/${shiftId}/close`, payload);
    return res.data.data;
  },

  reconcileCashierShift: async (shiftId: number, payload: { reconciliation_notes?: string }): Promise<CashierShift> => {
    const res = await apiClient.post<{ success: boolean; data: CashierShift }>(`/cashier-shifts/${shiftId}/reconcile`, payload);
    return res.data.data;
  },

  // Reversals
  requestReversal: async (paymentId: number, payload: { reason_category?: string; reason_details: string }): Promise<PaymentReversalRequest> => {
    const res = await apiClient.post<{ success: boolean; data: PaymentReversalRequest }>(`/payments/${paymentId}/reversal-requests`, payload);
    return res.data.data;
  },

  getReversalRequests: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{ success: boolean; data: PaymentReversalRequest[]; meta: any }>('/payment-reversal-requests', { params });
    return res.data;
  },

  approveReversal: async (requestId: number, notes?: string): Promise<any> => {
    const res = await apiClient.post<any>(`/payment-reversal-requests/${requestId}/approve`, { notes });
    return res.data;
  },

  rejectReversal: async (requestId: number, notes?: string): Promise<any> => {
    const res = await apiClient.post<any>(`/payment-reversal-requests/${requestId}/reject`, { notes });
    return res.data;
  },

  // Notifications
  getNotifications: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{ success: boolean; data: PaymentNotification[]; meta: any }>('/payment-notifications', { params });
    return res.data;
  },

  retryNotification: async (notificationId: number): Promise<PaymentNotification> => {
    const res = await apiClient.post<{ success: boolean; data: PaymentNotification }>(`/payment-notifications/${notificationId}/retry`);
    return res.data.data;
  },

  // Student Payment Ledger
  getStudentPayments: async (studentId: number): Promise<any> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/students/${studentId}/payments`);
    return res.data.data;
  },
};
