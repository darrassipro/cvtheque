/**
 * Hook useCVData
 * Principe SOLID: SRP - Gestion données CV uniquement
 * Principe SOLID: DIP - Dépend de l'interface ICVService
 */

import { useState, useEffect, useCallback } from 'react';
import { CV, CVCardDisplay } from '@/types/cv.types';
import { ICVService } from '@/services/cv/cvService.types';
import { cvService } from '@/services/cv/cvService.mock';

interface UseCVDataReturn {
  cvs: CV[];
  displayCVs: CVCardDisplay[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les données des CVs
 * Abstrait la source de données (mock, API)
 * 
 * @param service - Service CV à utiliser (défaut: cvService mock)
 * @returns Données des CVs et état de chargement
 * 
 * @example
 * const { cvs, displayCVs, loading, error } = useCVData();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * return <CVList cvs={displayCVs} />;
 */
export function useCVData(service: ICVService = cvService): UseCVDataReturn {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [displayCVs, setDisplayCVs] = useState<CVCardDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger les CVs
  const fetchCVs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupération des CVs via le service
      const data = await service.getAllCVs();
      setCVs(data);

      // Transformation en format d'affichage
      const displayData = data.map(cv => service.toCVCardDisplay(cv));
      setDisplayCVs(displayData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des CVs');
      setError(error);
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Charger les CVs au montage du composant
  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // Fonction publique pour recharger les données
  const refetch = useCallback(async () => {
    await fetchCVs();
  }, [fetchCVs]);

  return {
    cvs,
    displayCVs,
    loading,
    error,
    refetch
  };
}