/**
 * Types pour les filtres de recherche
 * Principe SOLID: ISP - Interface spécifique pour les filtres
 */

import { ContractType, LanguageLevel, Seniority, WorkMode } from './cv.types';

export interface CVFilters {
  searchQuery?: string;
  ageRange?: AgeRange;
  skills?: string[];
  seniority?: Seniority[];
  experienceRange?: ExperienceRange;
  languages?: LanguageFilter[];
  contractTypes?: ContractType[];
  workMode?: WorkMode[];
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface ExperienceRange {
  min: number;
  max: number;
}

export interface LanguageFilter {
  name: string;
  minLevel: LanguageLevel;
}

// Active filter display (pour l'UI)
export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  category: FilterCategory;
}

export enum FilterCategory {
  SEARCH = 'search',
  AGE = 'age',
  SKILL = 'skill',
  SENIORITY = 'seniority',
  EXPERIENCE = 'experience',
  LANGUAGE = 'language',
  CONTRACT = 'contract',
  WORK_MODE = 'workMode'
}

// Options pour les filtres prédéfinis
export interface FilterOption {
  id: string;
  label: string;
  value: any;
  category: FilterCategory;
}

// État des filtres pour l'UI
export interface FilterState {
  isOpen: boolean;
  activeFilters: ActiveFilter[];
  appliedCount: number;
}