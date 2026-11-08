import { apiClient, ensureCsrfToken } from './apiClient';
import type {
  ImportJobSummary,
  ImportJobDetail,
  ImportTemplateInfo,
  ImportValidationPreviewResponse,
  ImportRowItem,
  ExportDatasetInfo,
  ExportJobItem,
  ExportPreviewResult,
  ImportMode,
  ExportFormat,
} from '../types/dataExchange';

export const dataExchangeApi = {
  // --- Templates ---
  async listTemplates(): Promise<ImportTemplateInfo[]> {
    await ensureCsrfToken();
    const res = await apiClient.get('/api/v1/import-templates');
    return res.data.data;
  },

  async downloadTemplate(templateKey: string): Promise<Blob> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/import-templates/${templateKey}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // --- Import Jobs ---
  async listImportJobs(params?: {
    status?: string;
    mode?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: ImportJobSummary[]; total: number; current_page: number; last_page: number }> {
    await ensureCsrfToken();
    const res = await apiClient.get('/api/v1/import-jobs', { params });
    return {
      data: res.data.data || [],
      total: res.data.meta?.total || (res.data.data?.length ?? 0),
      current_page: res.data.meta?.current_page || 1,
      last_page: res.data.meta?.last_page || 1,
    };
  },

  async getImportJob(id: number): Promise<ImportJobDetail> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/import-jobs/${id}`);
    return res.data.data;
  },

  async uploadWorkbook(
    file: File,
    mode: ImportMode,
    templateVersion: string = '1.0'
  ): Promise<ImportJobSummary> {
    await ensureCsrfToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    formData.append('template_version', templateVersion);

    const res = await apiClient.post('/api/v1/import-jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async extractColumns(
    id: number,
    sheet?: string,
    headerRow?: number
  ): Promise<{ sheets: string[]; detected_columns: string[]; sample_rows: any[] }> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/import-jobs/${id}/columns`, {
      params: { sheet, header_row: headerRow },
    });
    return res.data.data;
  },

  async saveMapping(
    id: number,
    payload: {
      sheet: string;
      header_row: number;
      mapping: Record<string, string>;
    }
  ): Promise<void> {
    await ensureCsrfToken();
    await apiClient.post(`/api/v1/import-jobs/${id}/mapping`, payload);
  },

  async validateAndPreview(id: number): Promise<ImportValidationPreviewResponse> {
    await ensureCsrfToken();
    const res = await apiClient.post(`/api/v1/import-jobs/${id}/validate`);
    return res.data.data;
  },

  async getPreviewRows(
    id: number,
    params?: { status?: string; page?: number; per_page?: number }
  ): Promise<{ data: ImportRowItem[]; meta?: any }> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/import-jobs/${id}/rows`, { params });
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  async resolveDuplicates(
    id: number,
    resolutions: Record<number, { action: 'SKIP' | 'UPDATE' | 'CREATE_NEW' | 'OVERWRITE'; target_student_id?: number }>
  ): Promise<void> {
    await ensureCsrfToken();
    await apiClient.post(`/api/v1/import-jobs/${id}/resolve-duplicates`, { resolutions });
  },

  async commitImport(id: number, previewToken: string): Promise<ImportJobSummary> {
    await ensureCsrfToken();
    const res = await apiClient.post(`/api/v1/import-jobs/${id}/commit`, {
      preview_token: previewToken,
    });
    return res.data.data;
  },

  async cancelImport(id: number): Promise<void> {
    await ensureCsrfToken();
    await apiClient.post(`/api/v1/import-jobs/${id}/cancel`);
  },

  async downloadImportResultFile(id: number): Promise<Blob> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/import-jobs/${id}/result-file`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // --- Export Datasets & Jobs ---
  async listExportDatasets(): Promise<ExportDatasetInfo[]> {
    await ensureCsrfToken();
    const res = await apiClient.get('/api/v1/export-datasets');
    return res.data.data;
  },

  async getDatasetColumns(datasetKey: string): Promise<{ dataset: string; columns: ExportDatasetInfo['columns'] }> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/export-datasets/${datasetKey}/columns`);
    return res.data.data;
  },

  async previewExport(payload: {
    dataset: string;
    columns: string[];
    filters?: Record<string, any>;
    format?: ExportFormat;
  }): Promise<ExportPreviewResult> {
    await ensureCsrfToken();
    const res = await apiClient.post('/api/v1/export-jobs/preview', payload);
    return res.data.data;
  },

  async createExportJob(payload: {
    dataset: string;
    columns: string[];
    filters?: Record<string, any>;
    format: ExportFormat;
    locale?: 'bn' | 'en';
  }): Promise<ExportJobItem> {
    await ensureCsrfToken();
    const res = await apiClient.post('/api/v1/export-jobs', payload);
    return res.data.data;
  },

  async listExportJobs(params?: {
    page?: number;
    per_page?: number;
    dataset?: string;
    status?: string;
  }): Promise<{ data: ExportJobItem[]; total: number; current_page: number; last_page: number }> {
    await ensureCsrfToken();
    const res = await apiClient.get('/api/v1/export-jobs', { params });
    return {
      data: res.data.data || [],
      total: res.data.meta?.total || (res.data.data?.length ?? 0),
      current_page: res.data.meta?.current_page || 1,
      last_page: res.data.meta?.last_page || 1,
    };
  },

  async getExportJob(id: number): Promise<ExportJobItem> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/export-jobs/${id}`);
    return res.data.data;
  },

  async cancelExportJob(id: number): Promise<void> {
    await ensureCsrfToken();
    await apiClient.post(`/api/v1/export-jobs/${id}/cancel`);
  },

  async downloadExportArtifact(id: number): Promise<Blob> {
    await ensureCsrfToken();
    const res = await apiClient.get(`/api/v1/export-jobs/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
