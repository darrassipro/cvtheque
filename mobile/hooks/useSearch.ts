/**
 * Hook useSearch
 * Principe SOLID: SRP - Gestion de la recherche avec debounce
 */

import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  results: T[];
  isSearching: boolean;
}

/**
 * Hook pour gérer la recherche avec debounce
 * Optimise les performances en évitant trop de calculs
 * 
 * @param data - Données à rechercher
 * @param searchFields - Champs dans lesquels rechercher
 * @param debounceMs - Délai de debounce (défaut: 300ms)
 * @returns État de recherche et résultats
 * 
 * @example
 * const {
 *   query,
 *   setQuery,
 *   results
 * } = useSearch(cvs, ['personalInfo.fullName', 'professional.position']);
 * 
 * <Input value={query} onChangeText={setQuery} />
 * <List data={results} />
 */
export function useSearch<T extends Record<string, any>>(
  data: T[],
  searchFields: string[],
  debounceMs: number = 300
): UseSearchReturn<T> {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  // Indicateur si la recherche est en cours (query différent de debouncedQuery)
  const isSearching = query !== debouncedQuery;

  // Résultats filtrés (mémoïsés)
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const lowerQuery = debouncedQuery.toLowerCase();

    return data.filter(item => {
      // Chercher dans tous les champs spécifiés
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
          );
        }
        
        return false;
      });
    });
  }, [data, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isSearching
  };
}

/**
 * Récupère une valeur nested dans un objet
 * Ex: 'personalInfo.fullName' dans { personalInfo: { fullName: 'John' }}
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}