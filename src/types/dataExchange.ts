export type ImportMode = 'CREATE_ONLY' | 'UPDATE_ONLY' | 'UPSERT';

export type ImportJobStatus =
  | 'UPLOADED'
  | 'MAPPING_PENDING'
  | 'VALIDATING'
  | 'PREVIEW_READY'
  | 'COMMITTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RowValidationStatus =
  | 'PENDING'
  | 'VALID'
  | 'INVALID'
  | 'DUPLICATE'
  | 'READY'
  | 'COMMITTED'
  | 'FAILED'
  | 'SKIPPED';

export interface ImportJobSummary {
  id: number;
  tracking_code: string;
  original_file_name: string;
  file_size_bytes: number;
  mode: ImportMode;
  status: ImportJobStatus;
  template_version?: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  committed_rows: number;
  failed_rows: number;
  has_duplicate_issues: boolean;
  can_commit: boolean;
  can_cancel: boolean;
  download_available: boolean;
  preview_token?: string;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  requester?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ImportJobDetail extends ImportJobSummary {
  sheet_name?: string;
  header_row_index?: number;
  column_mapping?: Record<string, string>;
  duplicate_resolutions?: Record<string, any>;
  failure_reason?: string | null;
  lock_version: number;
  expires_at?: string | null;
  audit_logs?: Array<{
    id: number;
    action: string;
    details: any;
    user?: { id: number; name: string };
    created_at: string;
  }>;
}

export interface ImportRowItem {
  id: number;
  import_job_id: number;
  row_number: number;
  status: RowValidationStatus;
  matched_student_id?: number | null;
  matched_student?: {
    id: number;
    student_id: string;
    name_bn: string;
    name_en: string;
    phone?: string;
  } | null;
  raw_payload: Record<string, any>;
  parsed_payload: Record<string, any>;
  diff_payload?: Record<string, { old: any; new: any }> | null;
  errors: Record<string, string>;
  resolution?: string | null;
  committed_entity_id?: number | null;
}

export interface ImportValidationPreviewResponse {
  preview_token: string;
  mode: ImportMode;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicate: number;
  };
  rows: ImportRowItem[];
}

export interface ImportTemplateInfo {
  key: string;
  name_bn: string;
  name_en: string;
  version: string;
  description_bn: string;
  description_en: string;
  download_url: string;
  required_columns: Array<{
    name: string;
    label_bn: string;
    label_en: string;
    example: string;
  }>;
  optional_columns: Array<{
    name: string;
    label_bn: string;
    label_en: string;
    example: string;
  }>;
}

export interface ExportColumnDefinition {
  key: string;
  name_bn: string;
  name_en: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'DATETIME';
  sensitivity: 'ALLOWED' | 'SENSITIVE' | 'RESTRICTED';
}

export interface ExportDatasetInfo {
  key: string;
  name_bn: string;
  name_en: string;
  description_bn: string;
  description_en: string;
  filters_schema: string[];
  columns: ExportColumnDefinition[];
}

export type ExportFormat = 'XLSX' | 'PDF';
export type ExportStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export interface ExportJobItem {
  id: number;
  tracking_code: string;
  dataset: string;
  dataset_name_bn?: string;
  dataset_name_en?: string;
  format: ExportFormat;
  status: ExportStatus;
  row_count: number;
  file_size_kb: number;
  download_url?: string;
  can_download: boolean;
  can_cancel: boolean;
  expires_at?: string | null;
  created_at: string;
  requester?: {
    id: number;
    name: string;
  };
}

export interface ExportPreviewResult {
  dataset: string;
  row_count: number;
  estimated_kb: number;
  cutoff_at: string;
  columns_count: number;
}
