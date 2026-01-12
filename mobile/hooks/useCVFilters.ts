/**
 * Hook useCVFilters
 * Principe SOLID: SRP - Gestion des filtres uniquement
 * Principe SOLID: OCP - Extensible avec nouveaux filtres
 */

import { useState, useCallback, useMemo } from 'react';
import { CV } from '@/types/cv.types';
import { CVFilters, ActiveFilter, FilterCategory, FilterState } from '@/types/filter.types';
import { ICVService } from '@/services/cv/cvService.types';
import { cvService } from '@/services/cv/cvService.mock';
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
 * 
 * <FilterPanel
 *   onFilterChange={(key, value) => setFilter(key, value)}
 *   onClear={clearAllFilters}
 * />
 * <CVList cvs={filteredCVs} />
 */
export function useCVFilters({
  cvs,
  service = apiCVService
}: UseCVFiltersProps): UseCVFiltersReturn {
  const [filters, setFilters] = useState<CVFilters>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calcul des filtres actifs
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

    if (filters.contractTypes && filters.contractTypes.length > 0) {
      active.push({
        id: 'contract',
        label: 'Contrat',
        value: filters.contractTypes.join(', '),
        category: FilterCategory.CONTRACT
      });
    }

    if (filters.workMode && filters.workMode.length > 0) {
      active.push({
        id: 'workMode',
        label: 'Mode de travail',
        value: filters.workMode.join(', '),
        category: FilterCategory.WORK_MODE
      });
    }

    return active;
  }, [filters]);

  // Calcul des CVs filtrés (mémoïsé pour performance)
  const filteredCVs = useMemo(() => {
    // Si aucun filtre, retourner tous les CVs
    if (Object.keys(filters).length === 0) {
      return cvs;
    }

    // Filtrage local simple
    let results = [...cvs];

    // Filtre par recherche
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(cv =>
        cv.personalInfo.fullName.toLowerCase().includes(query) ||
        cv.professional.position.toLowerCase().includes(query) ||
        cv.skills.some(s => s.name.toLowerCase().includes(query))
      );
    }

    // Filtre par expérience
    if (filters.experienceRange) {
      results = results.filter(cv =>
        cv.professional.experience >= filters.experienceRange!.min &&
        cv.professional.experience <= filters.experienceRange!.max
      );
    }

    // Filtre par type de contrat
    if (filters.contractTypes && filters.contractTypes.length > 0) {
      results = results.filter(cv =>
        filters.contractTypes!.some(type =>
          cv.preferences.contractTypes.includes(type)
        )
      );
    }

    // Filtre par mode de travail
    if (filters.workMode && filters.workMode.length > 0) {
      results = results.filter(cv =>
        filters.workMode!.includes(cv.preferences.workMode)
      );
    }

    return results;
  }, [cvs, filters]);

  // Définir un filtre
  const setFilter = useCallback((key: keyof CVFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Supprimer un filtre
  const clearFilter = useCallback((key: keyof CVFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Supprimer tous les filtres
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Toggle le panneau de filtres
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev);
  }, []);

  // État des filtres pour l'UI
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