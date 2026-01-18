/**
 * Hook useCVFilters
 * Principe SOLID: SRP - Gestion des filtres uniquement
 * Principe SOLID: OCP - Extensible avec nouveaux filtres
 * Principe SOLID: DIP - Dépend des abstractions (interfaces)
 */

import { useState, useCallback, useMemo } from 'react';
import { CV } from '@/types/cv.types';
import { CVFilters, ActiveFilter, FilterCategory, FilterState } from '@/types/filter.types';
import { ICVService } from '@/services/cv/cvService.types';
import { apiCVService } from '@/services/cv/cvService.api';

interface UseCVFiltersProps {
  cvs: CV[];
  service?: ICVService;
}

interface UseCVFiltersReturn {
  filteredCVs: CV[];
  filters: CVFilters;
  filterState: FilterState;
  setFilter: (key: keyof CVFilters, value: any) => void;
  clearFilter: (key: keyof CVFilters) => void;
  clearAllFilters: () => void;
  toggleFilterPanel: () => void;
  loading: boolean;
}

/**
 * Vérifie si un CV contient le texte de recherche
 */
function matchesSearchQuery(cv: CV, query: string): boolean {
  if (!cv?.personalInfo || !query) return true;
  
  const lowerQuery = query.toLowerCase();
  return (
    cv.personalInfo.fullName?.toLowerCase().includes(lowerQuery) ||
    cv.professional?.position?.toLowerCase().includes(lowerQuery) ||
    cv.skills?.some((s) => s.name?.toLowerCase().includes(lowerQuery)) ||
    false
  );
}

/**
 * Vérifie si l'expérience du CV correspond à la plage
 */
function matchesExperienceRange(
  cv: CV,
  range: { min: number; max: number } | undefined
): boolean {
  if (!range || !cv?.professional) return true;
  const exp = cv.professional.totalExperience || 0;
  return exp >= range.min && exp <= range.max;
}

/**
 * Vérifie si le type de contrat du CV correspond
 */
function matchesContractType(cv: CV, contractTypes: string[] | undefined): boolean {
  if (!contractTypes || contractTypes.length === 0 || !cv?.professional) return true;
  return contractTypes.includes(cv.professional.contractType || '');
}

/**
 * Vérifie si le mode de travail du CV correspond
 */
function matchesWorkMode(cv: CV, workModes: string[] | undefined): boolean {
  if (!workModes || workModes.length === 0 || !cv?.professional) return true;
  return workModes.includes(cv.professional.workMode || '');
}

/**
 * Applique tous les filtres à un CV
 */
function applyCVFilters(cv: CV, filters: CVFilters): boolean {
  if (!cv) return false;

  return (
    matchesSearchQuery(cv, filters.searchQuery || '') &&
    matchesExperienceRange(cv, filters.experienceRange) &&
    matchesContractType(cv, filters.contractTypes) &&
    matchesWorkMode(cv, filters.workMode)
  );
}

/**
 * Hook pour gérer les filtres des CVs
 * Calcule les CVs filtrés de manière optimisée
 * 
 * @param cvs - Liste des CVs à filtrer
 * @param service - Service CV pour le filtrage
 * @returns CVs filtrés et fonctions de gestion des filtres
 * 
 * @example
 * const {
 *   filteredCVs,
 *   filters,
 *   setFilter,
 *   clearAllFilters
 * } = useCVFilters({ cvs: allCVs });
 */
export function useCVFilters({
  cvs,
  service = apiCVService
}: UseCVFiltersProps): UseCVFiltersReturn {
  const [filters, setFilters] = useState<CVFilters>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Calcule les filtres actifs pour l'UI
   */
  const activeFilters = useMemo((): ActiveFilter[] => {
    const active: ActiveFilter[] = [];

    if (filters.searchQuery) {
      active.push({
        id: 'search',
        label: 'Recherche',
        value: filters.searchQuery,
        category: FilterCategory.SEARCH
      });
    }

    if (filters.experienceRange) {
      active.push({
        id: 'experience',
        label: 'Expérience',
        value: `${filters.experienceRange.min}-${filters.experienceRange.max} ans`,
        category: FilterCategory.EXPERIENCE
      });
    }

    if (filters.contractTypes?.length) {
      active.push({
        id: 'contract',
        label: 'Contrat',
        value: filters.contractTypes.join(', '),
        category: FilterCategory.CONTRACT
      });
    }

    if (filters.workMode?.length) {
      active.push({
        id: 'workMode',
        label: 'Mode de travail',
        value: filters.workMode.join(', '),
        category: FilterCategory.WORK_MODE
      });
    }

    return active;
  }, [filters]);

  /**
   * Calcule les CVs filtrés (optimisé avec useMemo)
   */
  const filteredCVs = useMemo(() => {
    // Si aucun filtre actif, retourner tous les CVs
    if (Object.keys(filters).length === 0) {
      return cvs;
    }

    // Appliquer tous les filtres
    return cvs.filter((cv) => applyCVFilters(cv, filters));
  }, [cvs, filters]);

  /**
   * Définir un filtre
   */
  const setFilter = useCallback((key: keyof CVFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Supprimer un filtre spécifique
   */
  const clearFilter = useCallback((key: keyof CVFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  /**
   * Supprimer tous les filtres
   */
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Toggle le panneau des filtres
   */
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen((prev) => !prev);
  }, []);

  /**
   * État des filtres pour l'UI
   */
  const filterState: FilterState = {
    isOpen: isFilterPanelOpen,
    activeFilters,
    appliedCount: activeFilters.length
  };

  return {
    filteredCVs,
    filters,
    filterState,
    setFilter,
    clearFilter,
    clearAllFilters,
    toggleFilterPanel,
    loading
  };
}