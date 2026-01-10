/**
 * Types pour l'onboarding
 * Principe SOLID: SRP - Types séparés pour l'onboarding
 */

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
  textColor?: string;
}

export interface OnboardingState {
  currentSlide: number;
  totalSlides: number;
  isCompleted: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface OnboardingActions {
  next: () => void;
  previous: () => void;
  skip: () => void;
  goToSlide: (index: number) => void;
  complete: () => void;
}

// Configuration onboarding
export interface OnboardingConfig {
  slides: OnboardingSlide[];
  showSkipButton: boolean;
  showPagination: boolean;
  autoPlayDuration?: number;
}