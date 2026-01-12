/**
 * Implémentation API du service CV
 * Principe SOLID: DIP - Implémentation concrète de l'interface
 * Utilise RTK Query pour les appels API
 */

import { CV, CVCardDisplay } from '@/types/cv.types';
import { CVFilters } from '@/types/filter.types';
import { ICVService } from './cvService.types';
import { store } from '@/lib/store';
import { cvApi } from '@/lib/services/cvApi';

/**
 * Service API pour l'environnement de production
 * Utilise RTK Query pour les appels réels au backend
 */
export class ApiCVService implements ICVService {
  /**
   * Récupère tous les CVs via l'API
   */
  async getAllCVs(): Promise<CV[]> {
    try {
      const result = await store.dispatch(
        cvApi.endpoints.listCVs.initiate({ page: 1, limit: 100 })
      );

      if ('data' in result && result.data?.data?.cvs) {
        return this.transformApiCVs(result.data.data.cvs);
      }

      return [];
    } catch (error) {
      console.error('Error fetching CVs from API:', error);
      throw error;
    }
  }

  /**
   * Récupère un CV par ID via l'API
   */
  async getCVById(id: string): Promise<CV | null> {
    try {
      const result = await store.dispatch(
        cvApi.endpoints.getCVById.initiate(id)
      );

      if ('data' in result && result.data?.data) {
        return this.transformApiCV(result.data.data);
      }

      return null;
    } catch (error) {
      console.error('Error fetching CV by ID from API:', error);
      return null;
    }
  }

  /**
   * Recherche des CVs par query via l'API
   */
  async searchCVs(query: string): Promise<CV[]> {
    try {
      const result = await store.dispatch(
        cvApi.endpoints.listCVs.initiate({ 
          page: 1, 
          limit: 100,
          search: query 
        })
      );

      if ('data' in result && result.data?.data?.cvs) {
        return this.transformApiCVs(result.data.data.cvs);
      }

      return [];
    } catch (error) {
      console.error('Error searching CVs from API:', error);
      return [];
    }
  }

  /**
   * Filtre les CVs selon les critères via l'API
   */
  async filterCVs(filters: CVFilters): Promise<CV[]> {
    try {
      const result = await store.dispatch(
        cvApi.endpoints.listCVs.initiate({ 
          page: 1, 
          limit: 100,
          search: filters.searchQuery,
          status: filters.status as any
        })
      );

      if ('data' in result && result.data?.data?.cvs) {
        return this.transformApiCVs(result.data.data.cvs);
      }

      return [];
    } catch (error) {
      console.error('Error filtering CVs from API:', error);
      return [];
    }
  }

  /**
   * Transforme un CV API en format CV interne
   */
  private transformApiCV(apiCV: any): CV {
    return {
      id: apiCV.id,
      personalInfo: {
        fullName: apiCV.extractedData?.personalInfo?.name || 'Unknown',
        email: apiCV.extractedData?.personalInfo?.email || '',
        phone: apiCV.extractedData?.personalInfo?.phone || '',
        address: apiCV.extractedData?.personalInfo?.address || '',
        age: 0,
        nationality: '',
      },
      professional: {
        position: apiCV.extractedData?.personalInfo?.position || 'No position',
        totalExperience: apiCV.extractedData?.experience?.length || 0,
        currentSalary: 0,
        expectedSalary: 0,
        contractType: 'CDI',
        workMode: 'Hybrid',
      },
      skills: (apiCV.extractedData?.skills || []).map((skill: any) => ({
        name: typeof skill === 'string' ? skill : skill.name,
        level: 'Intermédiaire',
        category: 'Technical',
      })),
      experience: (apiCV.extractedData?.experience || []).map((exp: any) => ({
        company: exp.company || '',
        position: exp.position || '',
        duration: exp.duration || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || '',
        achievements: exp.achievements || [],
      })),
      education: (apiCV.extractedData?.education || []).map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        year: edu.year || '',
        grade: edu.grade,
      })),
      metadata: {
        fileName: apiCV.fileName,
        uploadedAt: apiCV.uploadedAt,
        processingStatus: apiCV.processingStatus,
        fileSize: apiCV.fileSize,
      },
    };
  }

  /**
   * Transforme une liste de CVs API en format CV interne
   */
  private transformApiCVs(apiCVs: any[]): CV[] {
    return apiCVs.map(cv => this.transformApiCV(cv));
  }

  /**
   * Transforme un CV en format d'affichage pour les cartes
   */
  toCVCardDisplay(cv: CV): CVCardDisplay {
    return {
      id: cv.id,
      fullName: cv.personalInfo.fullName,
      position: cv.professional.position,
      location: cv.personalInfo.address,
      experience: `${cv.professional.totalExperience} ans`,
      contractType: cv.professional.contractType,
      workMode: cv.professional.workMode,
      topSkills: cv.skills.slice(0, 3).map(s => s.name),
      uploadedAt: cv.metadata?.uploadedAt || new Date().toISOString(),
      processingStatus: cv.metadata?.processingStatus || 'COMPLETED',
    };
  }
}

// Instance du service API
export const apiCVService = new ApiCVService();
