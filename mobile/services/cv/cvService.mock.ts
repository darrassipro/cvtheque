/**
 * Implémentation Mock du service CV
 * Principe SOLID: DIP - Implémentation concrète de l'interface
 * Principe SOLID: OCP - Extensible sans modification
 */

import { CV, CVCardDisplay } from '@/types/cv.types';
import { CVFilters } from '@/types/filter.types';
import { ICVService, CVServiceOptions } from './cvService.types';
import { mockCVs } from '@/data/mockCVs';

/**
 * Service Mock pour le développement
 * Simule des appels API avec données en mémoire
 */
export class MockCVService implements ICVService {
  private cvs: CV[];
  private options: CVServiceOptions;

  constructor(options: CVServiceOptions = {}) {
    this.cvs = mockCVs;
    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      cacheDuration: options.cacheDuration ?? 5 * 60 * 1000 // 5 minutes
    };
  }

  /**
   * Récupère tous les CVs
   * Simule un délai réseau
   */
  async getAllCVs(): Promise<CV[]> {
    await this.simulateNetworkDelay();
    return [...this.cvs];
  }

  /**
   * Récupère un CV par ID
   */
  async getCVById(id: string): Promise<CV | null> {
    await this.simulateNetworkDelay(100);
    return this.cvs.find(cv => cv.id === id) || null;
  }

  /**
   * Recherche des CVs par query
   * Recherche dans nom, poste, compétences
   */
  async searchCVs(query: string): Promise<CV[]> {
    await this.simulateNetworkDelay(200);
    
    if (!query.trim()) {
      return this.cvs;
    }

    const lowerQuery = query.toLowerCase();
    
    return this.cvs.filter(cv => {
      // Recherche dans le nom
      const nameMatch = cv.personalInfo.fullName.toLowerCase().includes(lowerQuery);
      
      // Recherche dans le poste
      const positionMatch = cv.professional.position.toLowerCase().includes(lowerQuery);
      
      // Recherche dans les compétences
      const skillsMatch = cv.skills.some(skill => 
        skill.name.toLowerCase().includes(lowerQuery)
      );
      
      return nameMatch || positionMatch || skillsMatch;
    });
  }

  /**
   * Filtre les CVs selon les critères
   */
  async filterCVs(filters: CVFilters): Promise<CV[]> {
    await this.simulateNetworkDelay(300);
    
    let results = [...this.cvs];

    // Filtre par query de recherche
    if (filters.searchQuery) {
      const lowerQuery = filters.searchQuery.toLowerCase();
      results = results.filter(cv => 
        cv.personalInfo.fullName.toLowerCase().includes(lowerQuery) ||
        cv.professional.position.toLowerCase().includes(lowerQuery) ||
        cv.skills.some(s => s.name.toLowerCase().includes(lowerQuery))
      );
    }

    // Filtre par âge
    if (filters.ageRange) {
      results = results.filter(cv => 
        cv.personalInfo.age >= filters.ageRange!.min &&
        cv.personalInfo.age <= filters.ageRange!.max
      );
    }

    // Filtre par compétences
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(cv => 
        filters.skills!.some(filterSkill => 
          cv.skills.some(cvSkill => 
            cvSkill.name.toLowerCase() === filterSkill.toLowerCase()
          )
        )
      );
    }

    // Filtre par seniorité
    if (filters.seniority && filters.seniority.length > 0) {
      results = results.filter(cv => 
        filters.seniority!.includes(cv.professional.seniority)
      );
    }

    // Filtre par expérience
    if (filters.experienceRange) {
      results = results.filter(cv => 
        cv.professional.experience >= filters.experienceRange!.min &&
        cv.professional.experience <= filters.experienceRange!.max
      );
    }

    // Filtre par langues
    if (filters.languages && filters.languages.length > 0) {
      results = results.filter(cv => 
        filters.languages!.every(filterLang => 
          cv.languages.some(cvLang => 
            cvLang.name.toLowerCase() === filterLang.name.toLowerCase() &&
            this.compareLanguageLevels(cvLang.level, filterLang.minLevel) >= 0
          )
        )
      );
    }

    // Filtre par type de contrat
    if (filters.contractTypes && filters.contractTypes.length > 0) {
      results = results.filter(cv => 
        filters.contractTypes!.some(filterContract => 
          cv.preferences.contractTypes.includes(filterContract)
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
  }

  /**
   * Transforme un CV en format d'affichage
   * Principe SOLID: SRP - Responsabilité unique de transformation
   */
  toCVCardDisplay(cv: CV): CVCardDisplay {
    return {
      id: cv.id,
      photo: cv.personalInfo.photo,
      fullName: cv.personalInfo.fullName,
      position: cv.professional.position,
      experience: cv.professional.experience,
      mainSkills: cv.skills.slice(0, 3).map(s => s.name),
      languages: cv.languages.map(l => `${l.name} (${l.level})`),
      contractType: cv.preferences.contractTypes.join(' / '),
      workMode: cv.preferences.workMode
    };
  }

  /**
   * Simule un délai réseau (privé)
   */
  private simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Compare les niveaux de langue (privé)
   * A1 < A2 < B1 < B2 < C1 < C2 < Natif
   */
  private compareLanguageLevels(level1: string, level2: string): number {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];
    return levels.indexOf(level1) - levels.indexOf(level2);
  }
}

// Instance par défaut (singleton)
export const cvService = new MockCVService();