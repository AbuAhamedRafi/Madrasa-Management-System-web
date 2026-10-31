import { apiClient } from './apiClient';
import type {
  PromotionAttempt,
  PromotionBatch,
  PromotionEligibilityResult,
  PromotionEvent,
  PromotionItem,
} from '../types/promotions';

export const promotionsApi = {
  // Individual
  previewIndividual: async (data: {
    student_id: number;
    source_enrollment_id: number;
    target_offering_section_id: number;
    target_academic_period_id: number;
    action?: string;
    academic_eligibility_confirmed?: boolean;
  }): Promise<PromotionEligibilityResult> => {
    const res = await apiClient.post('/api/v1/promotions/individual/preview', data);
    return res.data.data;
  },

  promoteIndividual: async (
    data: {
      student_id: number;
      source_enrollment_id: number;
      target_offering_section_id: number;
      target_academic_period_id: number;
      action?: string;
      academic_eligibility_confirmed: boolean;
      notes?: string;
    },
    idempotencyKey?: string
  ): Promise<any> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient.post('/api/v1/promotions/individual', data, { headers });
    return res.data.data;
  },

  // Batches
  listBatches: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    mode?: string;
    action?: string;
    source_academic_period_id?: number;
    target_academic_period_id?: number;
    search?: string;
  }): Promise<{ data: PromotionBatch[]; total: number; current_page: number; last_page: number }> => {
    const res = await apiClient.get('/api/v1/promotions/batches', { params });
    return res.data;
  },

  createBatch: async (data: {
    mode?: string;
    action?: string;
    source_academic_period_id: number;
    source_offering_section_id?: number | null;
    target_academic_period_id: number;
    target_academic_offering_id: number;
    default_target_section_id?: number;
    academic_eligibility_confirmed?: boolean;
    notes?: string;
    student_ids?: number[];
  }): Promise<PromotionBatch> => {
    const res = await apiClient.post('/api/v1/promotions/batches', data);
    return res.data.data;
  },

  getBatch: async (id: number): Promise<PromotionBatch> => {
    const res = await apiClient.get(`/api/v1/promotions/batches/${id}`);
    return res.data.data;
  },

  updateBatch: async (
    id: number,
    data: { lock_version: number; action?: string; notes?: string }
  ): Promise<PromotionBatch> => {
    const res = await apiClient.put(`/api/v1/promotions/batches/${id}`, data);
    return res.data.data;
  },

  cancelBatch: async (id: number): Promise<PromotionBatch> => {
    const res = await apiClient.delete(`/api/v1/promotions/batches/${id}`);
    return res.data.data;
  },

  // Items
  listItems: async (
    batchId: number,
    params?: { page?: number; per_page?: number; status?: string; search?: string }
  ): Promise<{ data: PromotionItem[]; total: number; current_page: number; last_page: number }> => {
    const res = await apiClient.get(`/api/v1/promotions/batches/${batchId}/items`, { params });
    return res.data;
  },

  updateItem: async (
    batchId: number,
    itemId: number,
    data: { target_offering_section_id?: number; action?: string; academic_eligibility_confirmed?: boolean }
  ): Promise<PromotionItem> => {
    const res = await apiClient.put(`/api/v1/promotions/batches/${batchId}/items/${itemId}`, data);
    return res.data.data;
  },

  removeItem: async (batchId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/promotions/batches/${batchId}/items/${itemId}`);
  },

  getItemAttempts: async (batchId: number, itemId: number): Promise<PromotionAttempt[]> => {
    const res = await apiClient.get(`/api/v1/promotions/batches/${batchId}/items/${itemId}/attempts`);
    return res.data.data;
  },

  // Batch Execution Lifecycle
  previewBatch: async (id: number): Promise<any> => {
    const res = await apiClient.post(`/api/v1/promotions/batches/${id}/preview`);
    return res.data.data;
  },

  executeBatch: async (id: number, idempotencyKey?: string): Promise<any> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient.post(`/api/v1/promotions/batches/${id}/execute`, {}, { headers });
    return res.data.data;
  },

  pauseBatch: async (id: number): Promise<PromotionBatch> => {
    const res = await apiClient.post(`/api/v1/promotions/batches/${id}/pause`);
    return res.data.data;
  },

  resumeBatch: async (id: number): Promise<any> => {
    const res = await apiClient.post(`/api/v1/promotions/batches/${id}/resume`);
    return res.data.data;
  },

  retryBatch: async (id: number): Promise<any> => {
    const res = await apiClient.post(`/api/v1/promotions/batches/${id}/retry`);
    return res.data.data;
  },

  getBatchEvents: async (id: number): Promise<PromotionEvent[]> => {
    const res = await apiClient.get(`/api/v1/promotions/batches/${id}/events`);
    return res.data.data;
  },

  getExportUrl: (id: number): string => {
    return `/api/v1/promotions/batches/${id}/export`;
  },
};
