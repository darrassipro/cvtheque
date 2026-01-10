/**
 * Service CV - Types et interfaces
 * Principe SOLID: DIP - Dépendre d'abstractions
 */

import { CV, CVCardDisplay } from '@/types/cv.types';
import { CVFilters } from '@/types/filter.types';

/**
 * Interface du service CV (abstraction)
 * Permet de changer l'implémentation (mock, API) sans toucher aux composants
 */
export interface ICVService {
  /**
   * Récupère tous les CVs
   */
  getAllCVs(): Promise<CV[]>;
  
  /**
   * Récupère un CV par ID
   */
  getCVById(id: string): Promise<CV | null>;
  
  /**
   * Recherche des CVs par query
   */
  searchCVs(query: string): Promise<CV[]>;
  
  /**
   * Filtre les CVs selon les critères
   */
  filterCVs(filters: CVFilters): Promise<CV[]>;
  
  /**
   * Transforme un CV en format d'affichage
   */
  toCVCardDisplay(cv: CV): CVCardDisplay;
}

/**
 * Options pour le service
 */
export interface CVServiceOptions {
  cacheEnabled?: boolean;
  cacheDuration?: number;
}

/**
 * Résultat de recherche
 */
export interface SearchResult {
  cvs: CV[];
  total: number;
  query: string;
}

/**
 * Résultat de filtrage
 */
export interface FilterResult {
  cvs: CV[];
  total: number;
  appliedFilters: CVFilters;
}