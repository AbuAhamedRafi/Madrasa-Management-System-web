import apiClient from './api';
import type {
  Student,
  Guardian,
  StudentIdentifier,
  StudentDocument,
  StudentDuplicateReview,
  DuplicateCheckResult,
} from '../types/students';

export const studentsApi = {
  // Directory & Search
  getStudents: async (params?: {
    query?: string;
    status?: string;
    admission_year?: number;
    gender?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ data: Student[]; meta: any }> => {
    const res = await apiClient.get('/api/v1/students', { params });
    return res.data;
  },

  getStudent: async (id: number): Promise<Student> => {
    const res = await apiClient.get(`/api/v1/students/${id}`);
    return res.data.data;
  },

  registerStudent: async (payload: any, idempotencyKey?: string): Promise<Student> => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const res = await apiClient.post('/api/v1/students', payload, { headers });
    return res.data.data;
  },

  updateStudent: async (id: number, payload: any): Promise<Student> => {
    const res = await apiClient.patch(`/api/v1/students/${id}`, payload);
    return res.data.data;
  },

  updateStatus: async (
    id: number,
    payload: { status: string; reason: string }
  ): Promise<Student> => {
    const res = await apiClient.patch(`/api/v1/students/${id}/status`, payload);
    return res.data.data;
  },

  financialLookup: async (query: string): Promise<any[]> => {
    const res = await apiClient.get('/api/v1/students/lookup', { params: { query } });
    return res.data.data;
  },

  // Guardians
  getGuardians: async (studentId: number): Promise<Guardian[]> => {
    const res = await apiClient.get(`/api/v1/students/${studentId}/guardians`);
    return res.data.data;
  },

  addGuardian: async (studentId: number, payload: any): Promise<Guardian> => {
    const res = await apiClient.post(`/api/v1/students/${studentId}/guardians`, payload);
    return res.data.data;
  },

  makePrimaryGuardian: async (studentId: number, guardianId: number): Promise<Guardian> => {
    const res = await apiClient.post(
      `/api/v1/students/${studentId}/guardians/${guardianId}/primary`
    );
    return res.data.data;
  },

  updateSmsConsent: async (
    studentId: number,
    guardianId: number,
    smsConsent: boolean,
    consentSource?: string
  ): Promise<Guardian> => {
    const res = await apiClient.patch(
      `/api/v1/students/${studentId}/guardians/${guardianId}/consent`,
      { sms_consent: smsConsent, consent_source: consentSource }
    );
    return res.data.data;
  },

  unlinkGuardian: async (studentId: number, guardianId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/students/${studentId}/guardians/${guardianId}`);
  },

  // Identifiers
  getIdentifiers: async (studentId: number): Promise<StudentIdentifier[]> => {
    const res = await apiClient.get(`/api/v1/students/${studentId}/identifiers`);
    return res.data.data;
  },

  addIdentifier: async (
    studentId: number,
    payload: { namespace: string; value: string; issuer?: string; reason?: string }
  ): Promise<StudentIdentifier> => {
    const res = await apiClient.post(`/api/v1/students/${studentId}/identifiers`, payload);
    return res.data.data;
  },

  removeIdentifier: async (studentId: number, identifierId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/students/${studentId}/identifiers/${identifierId}`);
  },

  // Duplicate Check & Review
  checkDuplicate: async (payload: any): Promise<DuplicateCheckResult> => {
    const res = await apiClient.post('/api/v1/students/check-duplicate', payload);
    return res.data.data;
  },

  submitDuplicateReview: async (payload: {
    proposed_payload: any;
    candidate_matches: any[];
  }): Promise<StudentDuplicateReview> => {
    const res = await apiClient.post('/api/v1/students/duplicate-reviews', payload);
    return res.data.data;
  },

  getAdminDuplicateReviews: async (params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ data: StudentDuplicateReview[]; meta: any }> => {
    const res = await apiClient.get('/api/v1/admin/student-duplicates', { params });
    return res.data;
  },

  decideDuplicateReview: async (
    id: number,
    decision: 'APPROVE' | 'REJECT',
    reason: string
  ): Promise<StudentDuplicateReview> => {
    const res = await apiClient.post(`/api/v1/admin/student-duplicates/${id}/decision`, {
      decision,
      reason,
    });
    return res.data.data;
  },

  // Documents
  getDocuments: async (studentId: number): Promise<StudentDocument[]> => {
    const res = await apiClient.get(`/api/v1/students/${studentId}/documents`);
    return res.data.data;
  },

  uploadDocument: async (
    studentId: number,
    file: File,
    type: string,
    reason?: string
  ): Promise<StudentDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (reason) formData.append('reason', reason);

    const res = await apiClient.post(`/api/v1/students/${studentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  downloadDocument: async (studentId: number, documentId: number): Promise<Blob> => {
    const res = await apiClient.get(
      `/api/v1/students/${studentId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return res.data;
  },

  verifyDocument: async (
    studentId: number,
    documentId: number,
    verificationStatus: 'VERIFIED' | 'REJECTED',
    reason: string
  ): Promise<StudentDocument> => {
    const res = await apiClient.post(
      `/api/v1/students/${studentId}/documents/${documentId}/verify`,
      { verification_status: verificationStatus, reason }
    );
    return res.data.data;
  },

  archiveDocument: async (
    studentId: number,
    documentId: number,
    reason?: string
  ): Promise<void> => {
    await apiClient.delete(`/api/v1/students/${studentId}/documents/${documentId}`, {
      data: { reason },
    });
  },
};
