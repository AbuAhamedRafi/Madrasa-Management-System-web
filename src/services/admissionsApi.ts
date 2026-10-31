import { apiClient } from './apiClient';
import type {
  AdmissionsWorkbenchMeta,
  EligibilityResult,
  Enrollment,
  EnrollmentStatusEvent,
  ReturningContext,
  SectionCapacity,
  SessionProgressionContext,
  StudentSearchItem,
} from '../types/admissions';

export const admissionsApi = {
  getWorkbench: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    program_id?: number;
    academic_period_id?: number;
    status?: string;
  }): Promise<{ data: Enrollment[]; meta: AdmissionsWorkbenchMeta }> => {
    const res = await apiClient.get('/api/v1/admissions/workbench', { params });
    return res.data;
  },

  searchStudents: async (query?: string, programId?: number, limit?: number): Promise<StudentSearchItem[]> => {
    const res = await apiClient.get('/api/v1/admissions/search-students', {
      params: { query, program_id: programId, limit },
    });
    return res.data.data;
  },

  checkEligibility: async (
    studentId: number,
    params: {
      academic_program_id: number;
      academic_period_id?: number;
      academic_cohort_id?: number;
    }
  ): Promise<EligibilityResult> => {
    const res = await apiClient.get(`/api/v1/admissions/students/${studentId}/eligibility`, {
      params,
    });
    return res.data.data;
  },

  getProgramCatalogs: async (programId: number): Promise<any> => {
    const res = await apiClient.get(`/api/v1/admissions/programs/${programId}/catalogs`);
    return res.data.data;
  },

  getSectionCapacity: async (sectionId: number): Promise<SectionCapacity> => {
    const res = await apiClient.get(`/api/v1/admissions/sections/${sectionId}/capacity`);
    return res.data.data;
  },

  getAlternativeSections: async (offeringId: number): Promise<SectionCapacity[]> => {
    const res = await apiClient.get(`/api/v1/admissions/offerings/${offeringId}/alternatives`);
    return res.data.data;
  },

  batchCheckCapacity: async (sectionIds: number[]): Promise<SectionCapacity[]> => {
    const res = await apiClient.post('/api/v1/admissions/enrollments/batch-capacity-check', {
      section_ids: sectionIds,
    });
    return res.data.data;
  },

  createEnrollment: async (payload: any, idempotencyKey?: string): Promise<Enrollment> => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const res = await apiClient.post('/api/v1/admissions/enrollments', payload, { headers });
    return res.data.data;
  },

  getReturningContext: async (studentId: number): Promise<ReturningContext> => {
    const res = await apiClient.get(`/api/v1/admissions/students/${studentId}/returning-context`);
    return res.data.data;
  },

  createReturningEnrollment: async (payload: any, idempotencyKey?: string): Promise<Enrollment> => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const res = await apiClient.post('/api/v1/admissions/enrollments/returning', payload, { headers });
    return res.data.data;
  },

  getSessionProgression: async (studentId: number): Promise<SessionProgressionContext> => {
    const res = await apiClient.get(`/api/v1/admissions/students/${studentId}/session-progression`);
    return res.data.data;
  },

  createSessionProgression: async (payload: any, idempotencyKey?: string): Promise<Enrollment> => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const res = await apiClient.post('/api/v1/admissions/enrollments/session-progression', payload, { headers });
    return res.data.data;
  },

  getEnrollment: async (
    id: number
  ): Promise<{ enrollment: Enrollment; section_capacity: SectionCapacity; handoff: any }> => {
    const res = await apiClient.get(`/api/v1/admissions/enrollments/${id}`);
    return res.data.data;
  },

  reallocateSection: async (
    id: number,
    payload: { new_section_id: number; reason: string }
  ): Promise<Enrollment> => {
    const res = await apiClient.post(`/api/v1/admissions/enrollments/${id}/reallocate`, payload);
    return res.data.data;
  },

  cancelEnrollment: async (id: number, reason: string): Promise<Enrollment> => {
    const res = await apiClient.post(`/api/v1/admissions/enrollments/${id}/cancel`, { reason });
    return res.data.data;
  },

  rejectEnrollment: async (id: number, reason: string): Promise<Enrollment> => {
    const res = await apiClient.post(`/api/v1/admissions/enrollments/${id}/reject`, { reason });
    return res.data.data;
  },

  getEnrollmentEvents: async (id: number): Promise<EnrollmentStatusEvent[]> => {
    const res = await apiClient.get(`/api/v1/admissions/enrollments/${id}/events`);
    return res.data.data;
  },
};

