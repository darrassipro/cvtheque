/**
 * Mock data pour les CVs
 * Données fictives pour développement et démonstration
 */

import { 
  CV, 
  ContractType, 
  LanguageLevel, 
  Seniority, 
  WorkMode 
} from '@/types/cv.types';

export const mockCVs: CV[] = [
  {
    id: '1',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Martinez',
      fullName: 'Sarah Martinez',
      photo: 'https://i.pravatar.cc/150?img=1',
      age: 28,
      email: 'sarah.martinez@email.com',
      phone: '+33 6 12 34 56 78'
    },
    professional: {
      position: 'Développeuse Full Stack',
      experience: 5,
      seniority: Seniority.INTERMEDIATE,
      summary: 'Passionnée par le développement web moderne et les architectures scalables'
    },
    skills: [
      { name: 'React', level: 'Avancé' as any },
      { name: 'Node.js', level: 'Avancé' as any },
      { name: 'MongoDB', level: 'Intermédiaire' as any },
      { name: 'TypeScript', level: 'Avancé' as any },
      { name: 'Docker', level: 'Intermédiaire' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.B2 },
      { name: 'Espagnol', level: LanguageLevel.C1 }
    ],
    preferences: {
      contractTypes: [ContractType.CDI],
      workMode: WorkMode.HYBRID,
      availability: 'Immédiate'
    }
  },
  {
    id: '2',
    personalInfo: {
      firstName: 'Thomas',
      lastName: 'Dubois',
      fullName: 'Thomas Dubois',
      photo: 'https://i.pravatar.cc/150?img=5',
      age: 32,
      email: 'thomas.dubois@email.com'
    },
    professional: {
      position: 'Chef de Projet Digital',
      experience: 7,
      seniority: Seniority.SENIOR,
      summary: 'Expert en gestion de projets Agile et transformation digitale'
    },
    skills: [
      { name: 'Agile', level: 'Expert' as any },
      { name: 'Scrum', level: 'Expert' as any },
      { name: 'Management', level: 'Avancé' as any },
      { name: 'JIRA', level: 'Avancé' as any },
      { name: 'Product Management', level: 'Avancé' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.C1 }
    ],
    preferences: {
      contractTypes: [ContractType.CDI],
      workMode: WorkMode.REMOTE,
      availability: '1 mois'
    }
  },
  {
    id: '3',
    personalInfo: {
      firstName: 'Amina',
      lastName: 'Benali',
      fullName: 'Amina Benali',
      photo: 'https://i.pravatar.cc/150?img=9',
      age: 26,
      email: 'amina.benali@email.com'
    },
    professional: {
      position: 'UX/UI Designer',
      experience: 3,
      seniority: Seniority.JUNIOR,
      summary: 'Créative et centrée utilisateur, spécialisée en design systems'
    },
    skills: [
      { name: 'Figma', level: 'Expert' as any },
      { name: 'Adobe XD', level: 'Avancé' as any },
      { name: 'Design System', level: 'Avancé' as any },
      { name: 'Prototypage', level: 'Avancé' as any },
      { name: 'User Research', level: 'Intermédiaire' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Arabe', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.B1 }
    ],
    preferences: {
      contractTypes: [ContractType.CDI, ContractType.CDD],
      workMode: WorkMode.ONSITE,
      availability: 'Immédiate'
    }
  },
  {
    id: '4',
    personalInfo: {
      firstName: 'Lucas',
      lastName: 'Bernard',
      fullName: 'Lucas Bernard',
      photo: 'https://i.pravatar.cc/150?img=12',
      age: 29,
      email: 'lucas.bernard@email.com'
    },
    professional: {
      position: 'Data Scientist',
      experience: 4,
      seniority: Seniority.INTERMEDIATE,
      summary: 'Spécialiste en Machine Learning et analyse de données complexes'
    },
    skills: [
      { name: 'Python', level: 'Expert' as any },
      { name: 'Machine Learning', level: 'Avancé' as any },
      { name: 'SQL', level: 'Avancé' as any },
      { name: 'TensorFlow', level: 'Avancé' as any },
      { name: 'Data Visualization', level: 'Intermédiaire' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.C1 },
      { name: 'Allemand', level: LanguageLevel.B2 }
    ],
    preferences: {
      contractTypes: [ContractType.CDI],
      workMode: WorkMode.HYBRID,
      availability: '2 mois'
    }
  },
  {
    id: '5',
    personalInfo: {
      firstName: 'Emma',
      lastName: 'Lefebvre',
      fullName: 'Emma Lefebvre',
      photo: 'https://i.pravatar.cc/150?img=16',
      age: 31,
      email: 'emma.lefebvre@email.com'
    },
    professional: {
      position: 'Marketing Manager',
      experience: 6,
      seniority: Seniority.SENIOR,
      summary: 'Experte en stratégie digitale et growth marketing'
    },
    skills: [
      { name: 'SEO', level: 'Expert' as any },
      { name: 'Content Marketing', level: 'Avancé' as any },
      { name: 'Analytics', level: 'Avancé' as any },
      { name: 'Google Ads', level: 'Avancé' as any },
      { name: 'Social Media', level: 'Avancé' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.C2 }
    ],
    preferences: {
      contractTypes: [ContractType.CDI],
      workMode: WorkMode.REMOTE,
      availability: 'Immédiate'
    }
  },
  {
    id: '6',
    personalInfo: {
      firstName: 'Karim',
      lastName: 'Aït-Ali',
      fullName: 'Karim Aït-Ali',
      photo: 'https://i.pravatar.cc/150?img=33',
      age: 24,
      email: 'karim.aitali@email.com'
    },
    professional: {
      position: 'Développeur Mobile',
      experience: 2,
      seniority: Seniority.JUNIOR,
      summary: 'Jeune développeur passionné par les applications mobiles natives et cross-platform'
    },
    skills: [
      { name: 'React Native', level: 'Avancé' as any },
      { name: 'Flutter', level: 'Intermédiaire' as any },
      { name: 'iOS/Android', level: 'Avancé' as any },
      { name: 'JavaScript', level: 'Avancé' as any },
      { name: 'Firebase', level: 'Intermédiaire' as any }
    ],
    languages: [
      { name: 'Français', level: LanguageLevel.C2 },
      { name: 'Anglais', level: LanguageLevel.B2 }
    ],
    preferences: {
      contractTypes: [ContractType.INTERNSHIP, ContractType.CDI],
      workMode: WorkMode.HYBRID,
      availability: 'Immédiate'
    }
  }
];