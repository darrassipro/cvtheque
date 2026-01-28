/**
 * Types pour les CVs
 * Principe SOLID: ISP - Interface spécifique pour chaque besoin
 */

export enum CVSource {
  USER_UPLOAD = 'USER_UPLOAD',
  SUPERADMIN_BULK = 'SUPERADMIN_BULK',
}

export enum CVStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export interface CV {
  id: string;
  personalInfo: PersonalInfo;
  professional: ProfessionalInfo;
  skills: Skill[];
  languages?: Language[];
  preferences?: JobPreferences;
  experience?: Experience[];
  education?: Education[];
  metadata?: CVMetadata;
}

export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  fullName: string;
  photo?: string;
  age: number;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  nationality?: string;
}

export interface ProfessionalInfo {
  position: string;
  totalExperience?: number;
  experience?: number; // en années
  seniority?: Seniority;
  summary?: string;
  currentSalary?: number;
  expectedSalary?: number;
  contractType?: string;
  workMode?: string;
}

export interface Experience {
  company: string;
  position: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  year?: string;
  grade?: string;
  description?: string;
}

export interface CVMetadata {
  fileName?: string;
  uploadedAt?: string;
  processingStatus?: string;
  fileSize?: number;
  source?: CVSource; // Upload source
  user?: {
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
  rawData?: any;
}

export interface ProfessionalInfo {
  position: string;
  experience: number; // en années
  seniority: Seniority;
  summary?: string;
}

export interface Skill {
  name: string;
  level?: SkillLevel;
  category?: string;
}

export interface Language {
  name: string;
  level: LanguageLevel;
}

export interface JobPreferences {
  contractTypes: ContractType[];
  workMode: WorkMode;
  availability?: string;
}

// Enums
export enum Seniority {
  JUNIOR = 'Junior',
  INTERMEDIATE = 'Intermédiaire',
  SENIOR = 'Senior',
  EXPERT = 'Expert'
}

export enum SkillLevel {
  BEGINNER = 'Débutant',
  INTERMEDIATE = 'Intermédiaire',
  ADVANCED = 'Avancé',
  EXPERT = 'Expert'
}

export enum LanguageLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  NATIVE = 'Natif'
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERNSHIP = 'Stage',
  FREELANCE = 'Freelance',
  ALTERNANCE = 'Alternance'
}

export enum WorkMode {
  REMOTE = 'Télétravail',
  ONSITE = 'Présentiel',
  HYBRID = 'Hybride'
}

// DTOs pour affichage (ISP - interface client spécifique)
export interface CVCardDisplay {
  id: string;
  photo: string;
  fullName: string;
  position: string;
  experience: number | string;
  mainSkills: string[]; // Top skills
  languages: string[]; // Formatted languages
  contractType: string;
  workMode: string;
  email?: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  totalExperienceYears?: number;
  seniorityLevel?: string;
  industry?: string;
  uploadedAt?: string;
  processingStatus?: string;
  education?: any[];
  workExperience?: any[];
  certifications?: any[];
  internships?: any[];
  aiSummary?: string;
}

// Type guards
export const isValidCV = (cv: any): cv is CV => {
  return (
    cv &&
    typeof cv.id === 'string' &&
    cv.personalInfo &&
    cv.professional &&
    Array.isArray(cv.skills) &&
    Array.isArray(cv.languages)
  );
};