/**
 * Données de l'onboarding
 * Principe SOLID: SRP - Séparation données / logique
 */

import { OnboardingSlide } from '@/types/onboarding.types';

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bienvenue chez BenCenterServices',
    description: 'La plateforme de matching intelligente qui connecte les meilleurs talents avec les entreprises innovantes',
    icon: '🚀',
    backgroundColor: '#AB8BFF'
  },
  {
    id: '2',
    title: 'CVThèque Intelligente',
    description: 'Accédez à une base de données complète de candidats qualifiés et trouvez le profil parfait en quelques clics',
    icon: '📋',
    backgroundColor: '#D6C7FF'
  },
  {
    id: '3',
    title: 'Filtres Avancés',
    description: 'Affinez votre recherche avec nos filtres puissants : compétences, expérience, langues, et bien plus encore',
    icon: '🔍',
    backgroundColor: '#AB8BFF'
  },
  {
    id: '4',
    title: 'Matching Précis',
    description: 'Notre algorithme intelligent vous propose les candidats les plus pertinents pour vos besoins',
    icon: '✨',
    backgroundColor: '#D6C7FF'
  }
];