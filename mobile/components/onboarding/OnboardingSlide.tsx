/**
 * Composant OnboardingSlide
 * Principe SOLID: SRP - Affichage d'un slide uniquement
 * Atomic Design: Organism
 */

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { OnboardingSlide as OnboardingSlideType } from '@/types/onboarding.types';

export interface OnboardingSlideProps {
  slide: OnboardingSlideType;
  isActive?: boolean;
}

/**
 * Affiche un slide d'onboarding
 * 
 * @example
 * <OnboardingSlide
 *   slide={onboardingSlides[0]}
 *   isActive={true}
 * />
 */
export function OnboardingSlide({ slide, isActive = true }: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: slide.backgroundColor }
        ]}
      >
        <Text style={styles.icon}>{slide.icon}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{slide.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
    shadowColor: '#AB8BFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  icon: {
    fontSize: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 17,
    color: '#E5E5E5',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
    fontWeight: '400',
  },
});