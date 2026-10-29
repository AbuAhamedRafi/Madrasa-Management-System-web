export type StudentStatus =
  | 'REGISTERED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'WITHDRAWN'
  | 'TRANSFERRED'
  | 'GRADUATED'
  | 'ARCHIVED';

export type GuardianRelation = 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN' | 'OTHER';

export type DocumentType =
  | 'BIRTH_CERTIFICATE'
  | 'PREVIOUS_TRANSCRIPT'
  | 'NID_GUARDIAN'
  | 'MEDICAL'
  | 'OTHER';

export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DuplicateReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Guardian {
  id: number;
  name_bn: string;
  name_en: string;
  phone: string;
  alternative_phone?: string | null;
  address_bn?: string | null;
  address_en?: string | null;
  occupation?: string | null;
  relation?: GuardianRelation;
  is_primary?: boolean;
  sms_consent?: boolean;
  consent_at?: string | null;
  consent_source?: string | null;
}

export interface StudentIdentifier {
  id: number;
  student_id: number;
  namespace: string;
  value_normalized: string;
  value_raw: string;
  issuer?: string | null;
  created_at?: string;
}

export interface StudentDocument {
  id: number;
  student_id: number;
  type: DocumentType;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  verification_status: DocumentVerificationStatus;
  verification_reason?: string | null;
  uploaded_by?: {
    id: number;
    username: string;
    name_bn: string;
    name_en: string;
  } | null;
  verified_by?: {
    id: number;
    username: string;
    name_bn: string;
    name_en: string;
  } | null;
  archived_at?: string | null;
  created_at?: string;
}

export interface StudentAuditHistory {
  id: string;
  action_code: string;
  reason?: string | null;
  before_metadata?: Record<string, any> | null;
  after_metadata?: Record<string, any> | null;
  actor?: {
    id: number;
    username: string;
    name_bn: string;
    name_en: string;
  } | null;
  created_at?: string;
}

export interface Student {
  id: number;
  student_id: string;
  name_bn: string;
  name_en: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  admission_date: string;
  status: StudentStatus;
  birth_registration_number?: string | null;
  present_address_bn?: string | null;
  present_address_en?: string | null;
  permanent_address_bn?: string | null;
  permanent_address_en?: string | null;
  profile_photo_path?: string | null;
  primary_guardian?: Guardian | null;
  guardians?: Guardian[];
  identifiers?: StudentIdentifier[];
  documents_count?: number;
  audit_history?: StudentAuditHistory[];
  created_at?: string;
  updated_at?: string;
}

export interface DuplicateCandidateMatch {
  student_id: string;
  name_bn: string;
  name_en: string;
  date_of_birth?: string;
  match_reasons: string[];
  confidence: number;
}

export interface DuplicateCheckResult {
  exact_match: boolean;
  is_blocked: boolean;
  has_potential_duplicate: boolean;
  requires_review: boolean;
  matches: DuplicateCandidateMatch[];
}

export interface StudentDuplicateReview {
  id: number;
  proposed_payload_hash: string;
  candidate_matches: any[];
  status: DuplicateReviewStatus;
  decision_reason?: string | null;
  submitted_by?: number;
  submitter?: {
    id: number;
    username: string;
    name_bn: string;
    name_en: string;
  } | null;
  approved_by?: number;
  approver?: {
    id: number;
    username: string;
    name_bn: string;
    name_en: string;
  } | null;
  student_id?: number | null;
  student?: Student | null;
  expires_at?: string | null;
  created_at?: string;
}
