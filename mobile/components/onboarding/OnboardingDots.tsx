/**
 * Composant OnboardingDots
 * Principe SOLID: SRP - Affichage pagination uniquement
 * Atomic Design: Molecule
 */

import { View, StyleSheet } from 'react-native';
import React from 'react';

export interface OnboardingDotsProps {
  total: number;
  current: number;
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Affiche les dots de pagination pour l'onboarding
 * 
 * @example
 * <OnboardingDots
 *   total={4}
 *   current={1}
 *   activeColor="#AB8BFF"
 *   inactiveColor="#666"
 * />
 */
export function OnboardingDots({
  total,
  current,
  activeColor = '#AB8BFF',
  inactiveColor = '#666'
}: OnboardingDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === current ? activeColor : inactiveColor,
              width: index === current ? 24 : 8,
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
});