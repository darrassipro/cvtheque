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

      console.log('[ApiCVService] Raw result:', JSON.stringify(result, null, 2).substring(0, 500));

      if ('data' in result && result.data?.data) {
        // Backend returns { success, data: [cvs], pagination }
        let cvs = Array.isArray(result.data.data) ? result.data.data : [];
        
        // Filter to only show completed CVs
        cvs = cvs.filter((cv: any) => cv.status === 'COMPLETED');
        
        console.log('[ApiCVService] Fetched CVs:', cvs.length);
        if (cvs.length > 0) {
          console.log('[ApiCVService] First CV sample:', {
            id: cvs[0].id?.substring(0, 8),
            status: cvs[0].status,
            originalFileName: cvs[0].originalFileName,
            hasExtractedData: !!cvs[0].extractedData,
            extractedDataFullName: cvs[0].extractedData?.personalInfo?.fullName,
          });
        }
        return this.transformApiCVs(cvs);
      }

      console.log('[ApiCVService] No data in result');
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

      if ('data' in result && result.data?.data) {
        const cvs = Array.isArray(result.data.data) ? result.data.data : [];
        return this.transformApiCVs(cvs);
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

      if ('data' in result && result.data?.data) {
        const cvs = Array.isArray(result.data.data) ? result.data.data : [];
        return this.transformApiCVs(cvs);
      }

      return [];
    } catch (error) {
      console.error('Error filtering CVs from API:', error);
      return [];
    }
  }

  /**
   * Transforme un CV API en format CV interne
   * ✅ Extracts all data from backend response correctly
   * ✅ Handles nested personalInfo structure
   * ✅ Maps all fields to frontend types
   * ✅ Provides fallbacks for missing data
   */
  private transformApiCV(apiCV: any): CV {
    // Extract data from the nested structure - robust to handle incomplete extraction
    const extractedData = apiCV.extractedData || {};
    
    // Extract personalInfo - backend structure has personalInfo object
    const personalInfo = extractedData.personalInfo || extractedData || {};
    
    // Extract fullName - try multiple sources
    const fullName = personalInfo.fullName || extractedData.fullName || apiCV.personalInfo?.fullName || 'Name not extracted';
    const email = personalInfo.email || extractedData.email || apiCV.personalInfo?.email || '';
    const phone = personalInfo.phone || extractedData.phone || apiCV.personalInfo?.phone || '';
    const address = personalInfo.address || extractedData.address || apiCV.personalInfo?.address || '';
    const city = personalInfo.city || extractedData.city || apiCV.personalInfo?.city || '';
    const country = personalInfo.country || extractedData.country || apiCV.personalInfo?.country || '';
    const age = personalInfo.age || extractedData.age || apiCV.personalInfo?.age || 0;
    const nationality = personalInfo.nationality || country || '';
    
    // Extract position - PRIMARY source from position field, fallback to first experience
    let position = extractedData.position || personalInfo.position || 'Position not extracted';
    
    // If still not found, try first experience entry
    if (!position || position === 'Position not extracted') {
      if (Array.isArray(extractedData.experience) && extractedData.experience.length > 0) {
        position = extractedData.experience[0].position || extractedData.experience[0].jobTitle || 'Position not extracted';
      }
    }
    
    // Extract skills - backend sends nested object with technical/soft/tools or flat array
    let skills: any[] = [];
    if (extractedData.skills) {
      if (typeof extractedData.skills === 'object' && !Array.isArray(extractedData.skills)) {
        // Nested structure: { technical: [], soft: [], tools: [] }
        const technical = extractedData.skills.technical || [];
        const soft = extractedData.skills.soft || [];
        const tools = extractedData.skills.tools || [];
        skills = [...technical, ...soft, ...tools].map((skill: any) => ({
          name: typeof skill === 'string' ? skill.trim() : skill.name || skill,
          level: 'Intermédiaire',
          category: 'Technical',
        }));
      } else if (Array.isArray(extractedData.skills)) {
        // Flat array
        skills = extractedData.skills.map((skill: any) => ({
          name: typeof skill === 'string' ? skill.trim() : skill.name || skill,
          level: 'Intermédiaire',
          category: 'Technical',
        }));
      }
    }

    // Extract total experience years - backend provides this field
    const totalExperienceYears = extractedData.totalExperienceYears || 0;
    const seniorityLevel = extractedData.seniorityLevel || 'Entry Level';

    // Extract languages - backend sends flat array, convert to objects with proficiency
    const languages = (extractedData.languages || []).map((lang: any) => {
      // If already an object with level
      if (typeof lang === 'object' && lang.level) {
        return {
          name: lang.name || lang.language || '',
          level: lang.level,
        };
      }
      // If string, capitalize and assign proficiency
      const langName = typeof lang === 'string' ? lang : '';
      const nameCapitalized = langName.charAt(0).toUpperCase() + langName.slice(1);
      return {
        name: nameCapitalized,
        level: 'B2', // Default proficiency level
      };
    }).filter(l => l.name);

    // Extract experience - map to frontend structure
    const experience = (extractedData.experience || []).map((exp: any) => ({
      company: exp.company || exp.companyName || '',
      position: exp.position || exp.jobTitle || exp.title || '',
      duration: exp.duration || '',
      startDate: exp.startDate || exp.start_date || '',
      endDate: exp.endDate || exp.end_date || '',
      description: exp.description || exp.responsibilities || '',
      achievements: Array.isArray(exp.achievements) ? exp.achievements : 
                    Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
    }));

    // Extract education - map to frontend structure
    const education = (extractedData.education || []).map((edu: any) => ({
      institution: edu.institution || edu.school || edu.university || '',
      degree: edu.degree || edu.qualification || '',
      field: edu.field_of_study || edu.fieldOfStudy || edu.field || edu.major || '',
      year: edu.end_date || edu.endDate || edu.year || edu.graduation_year || '',
      grade: edu.grade || edu.gpa || '',
      description: edu.description || '',
    }));

    // DEBUG LOG: Show what was extracted
    console.log('[transformApiCV] EXTRACTED DATA:', {
      fullName,
      position,
      email,
      phone,
      city,
      country,
      totalExperienceYears,
      seniorityLevel,
      skillsCount: skills.length,
      languagesCount: languages.length,
      experienceCount: experience.length,
      educationCount: education.length,
    });

    return {
      id: apiCV.id,
      personalInfo: {
        fullName: fullName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        country: country,
        age: age,
        nationality: nationality,
      },
      professional: {
        position: position,
        totalExperience: totalExperienceYears,
        experience: totalExperienceYears,
        seniority: seniorityLevel as any,
        summary: extractedData.summary || apiCV.aiSummary || '',
        currentSalary: 0,
        expectedSalary: 0,
        contractType: 'CDI',
        workMode: 'Hybride',
      },
      skills: skills,
      languages: languages,
      experience: experience,
      education: education,
      metadata: {
        fileName: apiCV.originalFileName,
        uploadedAt: apiCV.createdAt,
        processingStatus: apiCV.status,
        fileSize: apiCV.fileSize,
        rawData: {
          ...apiCV,
          extractedData: extractedData,
          photoUrl: apiCV.photoUrl,
          aiSummary: apiCV.aiSummary,
        },
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
   * ✅ Extracts data with proper fallbacks
   * ✅ Formats languages with proficiency levels
   * ✅ Returns complete CVCardDisplay with all fields
   * ✅ Handles photo priority: user.avatar → cv.photo → generated avatar
   * ✅ Gracefully handles missing data
   */
  toCVCardDisplay(cv: CV): CVCardDisplay {
    // Guard against missing or invalid cv
    if (!cv || !cv.id) {
      throw new Error('Invalid CV: missing id');
    }

    // Extract data from metadata if available
    const extractedData = cv.metadata?.rawData?.extractedData || {};
    const rawData = cv.metadata?.rawData || {};
    const personalInfo = cv.personalInfo || {} as any;
    const professional = cv.professional || {} as any;
    const skillsArray = cv.skills || [];
    
    // Get position from personal info (backend adds it there)
    const position = personalInfo.position || 
             professional.position || 
             extractedData.personalInfo?.position || 
             'Professional';
    
    // Get languages - try multiple sources
    const languages = extractedData.languages || cv.languages || [];
    
    // Format languages with proficiency if available
    const formattedLanguages = languages.map((lang: any) => {
      if (typeof lang === 'string') {
        // Just a string like "english" - capitalize and add default proficiency
        const langName = lang.charAt(0).toUpperCase() + lang.slice(1);
        return `${langName} (B2)`;
      }
      // Already an object with name and level
      const langName = lang.name || lang.language || '';
      const proficiency = lang.level || lang.proficiency || 'B2';
      return proficiency ? `${langName} (${proficiency})` : langName;
    }).filter(Boolean);

    /**
     * Photo Priority Chain (Quality Fix):
     * 1. cv.metadata?.rawData?.photo - Updated CV photo from avatar upload
     * 2. extractedData.photo - Original CV extraction (fallback)
     * 3. rawData.photoUrl - Metadata photo URL
     * 4. cv.metadata?.rawData?.user?.avatar - User profile avatar (when CV linked to user)
     * 5. Generated avatar with initials (fallback)
     */
    const fullName = personalInfo.fullName || rawData.originalFileName || rawData.fileName || cv.originalFileName || 'Unknown';
    const photo = 
      cv.metadata?.rawData?.photo ||  // ✅ Primary: Updated by avatar upload
      extractedData.photo ||            // Fallback 1: Original extraction
      rawData.photoUrl ||               // Fallback 2: Metadata URL
      (cv.metadata?.rawData?.user?.avatar) ||  // Fallback 3: User avatar
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=F97316&color=fff`;

    // Get location - combine city and country (guard if personalInfo missing)
    const location = (personalInfo.address) || 
                     ((personalInfo.city && personalInfo.country)
                       ? `${personalInfo.city}, ${personalInfo.country}`
                       : '') || '';

    // DEBUG LOG: Show what's being displayed
    console.log('[toCVCardDisplay] CARD DATA:', {
      fullName,
      position,
      location,
      totalExperienceYears: professional.totalExperience,
      seniorityLevel: professional.seniority,
      mainSkillsCount: skillsArray.length,
      languagesCount: formattedLanguages.length,
      photoSource: photo.includes('ui-avatars') ? 'generated' : 'uploaded',
    });

    return {
      id: cv.id,
      photo: photo,
      fullName: personalInfo.fullName || fullName,
      position: position,
      location: location,
      city: personalInfo.city || '',
      country: personalInfo.country || '',
      experience: professional.totalExperience || 0,
      contractType: professional.contractType || 'CDI',
      workMode: professional.workMode || 'Hybride',
      mainSkills: (skillsArray || []).slice(0, 5).map((s: any) => s?.name || s).filter(Boolean),
      languages: formattedLanguages,
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      totalExperienceYears: professional.totalExperience || 0,
      seniorityLevel: professional.seniority || extractedData.seniorityLevel || 'Entry Level',
      industry: extractedData.industry || '',
      uploadedAt: cv.metadata?.uploadedAt || new Date().toISOString(),
      processingStatus: cv.metadata?.processingStatus || 'COMPLETED',
      education: cv.education || [],
      workExperience: cv.experience || [],
      certifications: extractedData.certifications || [],
      internships: extractedData.internships || [],
      aiSummary: cv.metadata?.rawData?.aiSummary || professional.summary || '',
    };
  }
}

// Instance du service API
export const apiCVService = new ApiCVService();
