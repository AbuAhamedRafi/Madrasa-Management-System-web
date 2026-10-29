import { apiClient } from './apiClient';
import type {
  AcademicCohort,
  AcademicOffering,
  AcademicPeriod,
  AcademicProgram,
  AcademicSummary,
  AcademicTrack,
  Department,
  EducationAuthority,
  EducationLevel,
  HierarchyAuthorityNode,
  InstitutionProfile,
  OfferingSection,
  ProgramClass,
} from '../types/academics';

export const academicsApi = {
  // Institution
  getInstitution: async (): Promise<InstitutionProfile> => {
    const res = await apiClient.get('/api/v1/academics/institution');
    return res.data.data;
  },
  updateInstitution: async (payload: Partial<InstitutionProfile>): Promise<InstitutionProfile> => {
    const res = await apiClient.patch('/api/v1/admin/institution', payload);
    return res.data.data;
  },
  uploadInstitutionLogo: async (file: File): Promise<InstitutionProfile> => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.post('/api/v1/admin/institution/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Summary, Hierarchy & Options
  getSummary: async (programId?: number): Promise<AcademicSummary> => {
    const res = await apiClient.get('/api/v1/academics/summary', {
      params: programId ? { program_id: programId } : undefined,
    });
    return res.data.data;
  },
  getHierarchy: async (params?: { authority_id?: number; search?: string }): Promise<HierarchyAuthorityNode[]> => {
    const res = await apiClient.get('/api/v1/academics/hierarchy', { params });
    return res.data.data;
  },
  getOptions: async (params?: { program_id?: number; academic_period_id?: number; active_only?: boolean }) => {
    const res = await apiClient.get('/api/v1/academics/options', { params });
    return res.data.data;
  },

  // Authorities & Education Levels
  getAuthorities: async (params?: { active?: boolean; page?: number; page_size?: number }): Promise<EducationAuthority[]> => {
    const res = await apiClient.get('/api/v1/academics/authorities', { params });
    return res.data.data;
  },
  createAuthority: async (payload: { code: string; name_bn: string; name_en: string; sort_order?: number }): Promise<EducationAuthority> => {
    const res = await apiClient.post('/api/v1/admin/academics/authorities', payload);
    return res.data.data;
  },
  getLevels: async (params?: { authority_id?: number; active?: boolean }): Promise<EducationLevel[]> => {
    const res = await apiClient.get('/api/v1/academics/levels', { params });
    return res.data.data;
  },
  createLevel: async (payload: { authority_id: number; code: string; name_bn: string; name_en: string; sort_order?: number }): Promise<EducationLevel> => {
    const res = await apiClient.post('/api/v1/admin/academics/levels', payload);
    return res.data.data;
  },

  // Departments
  getDepartments: async (params?: { search?: string; active?: boolean; page?: number }): Promise<Department[]> => {
    const res = await apiClient.get('/api/v1/academics/departments', { params });
    return res.data.data;
  },
  createDepartment: async (payload: {
    code: string;
    name_bn: string;
    name_en: string;
    description_bn?: string;
    description_en?: string;
    sort_order?: number;
  }): Promise<Department> => {
    const res = await apiClient.post('/api/v1/admin/academics/departments', payload);
    return res.data.data;
  },
  updateDepartmentStatus: async (id: number, is_active: boolean, reason?: string): Promise<Department> => {
    const res = await apiClient.patch(`/api/v1/admin/academics/departments/${id}/status`, { is_active, reason });
    return res.data.data;
  },

  // Programs
  getPrograms: async (params?: { department_id?: number; scheme?: string; active?: boolean; state?: string }): Promise<AcademicProgram[]> => {
    const res = await apiClient.get('/api/v1/academics/programs', { params });
    return res.data.data;
  },
  getProgram: async (id: number): Promise<AcademicProgram> => {
    const res = await apiClient.get(`/api/v1/academics/programs/${id}`);
    return res.data.data;
  },
  getProgramStructure: async (id: number): Promise<AcademicProgram> => {
    const res = await apiClient.get(`/api/v1/academics/programs/${id}/structure`);
    return res.data.data;
  },
  createProgram: async (payload: {
    code: string;
    department_id: number;
    education_level_id: number;
    name_bn: string;
    name_en: string;
    scheme: 'CALENDAR_YEAR' | 'SESSION_BASED';
    duration_years: number;
    state?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  }): Promise<AcademicProgram> => {
    const res = await apiClient.post('/api/v1/admin/academics/programs', payload);
    return res.data.data;
  },
  updateProgram: async (id: number, payload: Partial<AcademicProgram>): Promise<AcademicProgram> => {
    const res = await apiClient.patch(`/api/v1/admin/academics/programs/${id}`, payload);
    return res.data.data;
  },
  updateProgramStatus: async (id: number, state: 'DRAFT' | 'ACTIVE' | 'INACTIVE', reason?: string): Promise<AcademicProgram> => {
    const res = await apiClient.patch(`/api/v1/admin/academics/programs/${id}/status`, { state, reason });
    return res.data.data;
  },

  // Classes & Tracks
  getClasses: async (programId: number, active?: boolean): Promise<ProgramClass[]> => {
    const res = await apiClient.get('/api/v1/academics/classes', {
      params: { program_id: programId, ...(active !== undefined ? { active } : {}) },
    });
    return res.data.data;
  },
  createClass: async (payload: {
    program_id: number;
    code: string;
    name_bn: string;
    name_en: string;
    stage_number: number;
    sort_order?: number;
  }): Promise<ProgramClass> => {
    const res = await apiClient.post('/api/v1/admin/academics/classes', payload);
    return res.data.data;
  },
  getTracks: async (programId: number, active?: boolean): Promise<AcademicTrack[]> => {
    const res = await apiClient.get('/api/v1/academics/tracks', {
      params: { program_id: programId, ...(active !== undefined ? { active } : {}) },
    });
    return res.data.data;
  },
  createTrack: async (payload: {
    program_id: number;
    code: string;
    name_bn: string;
    name_en: string;
  }): Promise<AcademicTrack> => {
    const res = await apiClient.post('/api/v1/admin/academics/tracks', payload);
    return res.data.data;
  },

  // Cohorts & Periods
  getCohorts: async (programId: number, status?: string): Promise<AcademicCohort[]> => {
    const res = await apiClient.get('/api/v1/academics/cohorts', {
      params: { program_id: programId, ...(status && status !== 'ALL' ? { status } : {}) },
    });
    return res.data.data;
  },
  createCohort: async (payload: {
    program_id: number;
    label: string;
    intake_year: number;
    description?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  }): Promise<AcademicCohort> => {
    const res = await apiClient.post('/api/v1/admin/academics/cohorts', payload);
    return res.data.data;
  },
  getPeriods: async (params?: { program_id?: number; cohort_id?: number; state?: string }): Promise<AcademicPeriod[]> => {
    const res = await apiClient.get('/api/v1/academics/periods', { params });
    return res.data.data;
  },
  getPeriod: async (id: number): Promise<AcademicPeriod> => {
    const res = await apiClient.get(`/api/v1/academics/periods/${id}`);
    return res.data.data;
  },
  createPeriod: async (payload: {
    program_id: number;
    cohort_id?: number | null;
    label: string;
    calendar_year?: number | null;
    study_year_number?: number | null;
    start_date: string;
    end_date: string;
  }): Promise<AcademicPeriod> => {
    const res = await apiClient.post('/api/v1/admin/academics/periods', payload);
    return res.data.data;
  },
  updatePeriodStatus: async (
    id: number,
    payload: { state: 'DRAFT' | 'OPEN' | 'CLOSED'; lock_version: number; reason?: string }
  ): Promise<AcademicPeriod> => {
    const res = await apiClient.patch(`/api/v1/admin/academics/periods/${id}/status`, payload);
    return res.data.data;
  },

  // Offerings & Sections
  getOfferings: async (academicPeriodId: number, trackId?: number): Promise<AcademicOffering[]> => {
    const res = await apiClient.get('/api/v1/academics/offerings', {
      params: { academic_period_id: academicPeriodId, ...(trackId ? { academic_track_id: trackId } : {}) },
    });
    return res.data.data;
  },
  createOffering: async (payload: {
    academic_period_id: number;
    program_class_id: number;
    academic_track_id?: number | null;
  }): Promise<AcademicOffering> => {
    const res = await apiClient.post('/api/v1/admin/academics/offerings', payload);
    return res.data.data;
  },
  createSection: async (
    offeringId: number,
    payload: { code: string; name_bn: string; name_en: string; capacity: number }
  ): Promise<OfferingSection> => {
    const res = await apiClient.post(`/api/v1/admin/academics/offerings/${offeringId}/sections`, payload);
    return res.data.data;
  },
  updateSectionStatus: async (sectionId: number, is_active: boolean): Promise<OfferingSection> => {
    const res = await apiClient.patch(`/api/v1/admin/academics/sections/${sectionId}/status`, { is_active });
    return res.data.data;
  },
};

