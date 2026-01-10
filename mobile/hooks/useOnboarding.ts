/**
 * Hook useOnboarding
 * Principe SOLID: SRP - Gestion logique onboarding uniquement
 * Principe SOLID: OCP - Extensible via configuration
 */

import { useState, useCallback, useEffect } from 'react';
import { OnboardingSlide, OnboardingState, OnboardingActions } from '@/types/onboarding.types';

interface UseOnboardingProps {
  slides: OnboardingSlide[];
  onComplete?: () => void;
}

interface UseOnboardingReturn extends OnboardingState, OnboardingActions {}

/**
 * Hook pour gérer l'état et la navigation de l'onboarding
 * Sépare la logique de l'UI
 * 
 * @param slides - Liste des slides
 * @param onComplete - Callback appelé quand l'onboarding est terminé
 * @returns État et actions pour contrôler l'onboarding
 * 
 * @example
 * const onboarding = useOnboarding({
 *   slides: onboardingSlides,
 *   onComplete: () => navigation.navigate('Home')
 * });
 * 
 * <OnboardingSlide slide={slides[onboarding.currentSlide]} />
 * <Button onPress={onboarding.next}>Suivant</Button>
 */
export function useOnboarding({
  slides,
  onComplete
}: UseOnboardingProps): UseOnboardingReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSlides = slides.length;
  const canGoNext = currentSlide < totalSlides - 1;
  const canGoPrevious = currentSlide > 0;

  // Navigation suivant
  const next = useCallback(() => {
    if (canGoNext) {
      setCurrentSlide(prev => prev + 1);
    } else {
      complete();
    }
  }, [canGoNext]);

  // Navigation précédent
  const previous = useCallback(() => {
    if (canGoPrevious) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [canGoPrevious]);

  // Passer l'onboarding
  const skip = useCallback(() => {
    complete();
  }, []);

  // Aller à un slide spécifique
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  }, [totalSlides]);

  // Terminer l'onboarding
  const complete = useCallback(() => {
    setIsCompleted(true);
    onComplete?.();
  }, [onComplete]);

  // État
  const state: OnboardingState = {
    currentSlide,
    totalSlides,
    isCompleted,
    canGoNext,
    canGoPrevious
  };

  // Actions
  const actions: OnboardingActions = {
    next,
    previous,
    skip,
    goToSlide,
    complete
  };

  return {
    ...state,
    ...actions
  };
}