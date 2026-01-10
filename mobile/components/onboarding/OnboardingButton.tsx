/**
 * Composant OnboardingButton
 * Principe SOLID: SRP - Bouton navigation onboarding uniquement
 * Atomic Design: Molecule
 */

import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react';

export interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

/**
 * Bouton spécifique pour l'onboarding
 * 
 * @example
 * <OnboardingButton
 *   label="Suivant"
 *   onPress={handleNext}
 *   variant="primary"
 * />
 */
export function OnboardingButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false
}: OnboardingButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`]
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  button_primary: {
    backgroundColor: '#AB8BFF',
  },
  button_secondary: {
    backgroundColor: 'rgba(171, 139, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#AB8BFF',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: '#AB8BFF',
  },
  disabled: {
    opacity: 0.5,
  },
});