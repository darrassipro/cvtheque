export enum CVStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum DocumentType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  IMAGE = 'IMAGE',
}

export interface CV {
  id: string;
  userId: string;
  originalFileName: string;
  documentType: DocumentType;
  fileSize: number;
  status: CVStatus;
  photoUrl?: string;
  photoPublicId?: string;
  aiSummary?: string;
  confidenceScore?: number;
  llmProvider?: string;
  llmModel?: string;
  processingError?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  extractedData?: CVExtractedData;
}

export interface CVExtractedData {
  id: string;
  cvId: string;
  personalInfo?: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
  references?: Reference[];
  rawExtractedJson?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  nationality?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
}

export interface Experience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  location?: string;
}

export interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  location?: string;
  gpa?: string;
}

export interface Language {
  language: string;
  proficiency?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  name: string;
  description?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  technologies?: string[];
}

export interface Reference {
  name: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface CVListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CVStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'fileName';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export interface CVListResponse {
  success: boolean;
  data: {
    cvs: CV[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
