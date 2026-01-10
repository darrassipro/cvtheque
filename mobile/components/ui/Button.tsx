/**
 * Composant Button
 * Principe SOLID: SRP - Affichage d'un bouton uniquement
 * Principe SOLID: OCP - Extensible via props (variant, size)
 * Atomic Design: Atom
 */

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/theme';

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Composant Button réutilisable
 * Respecte le design system BenCenterServices
 * 
 * @example
 * <Button variant="primary" size="md" onPress={handlePress}>
 *   Envoyer
 * </Button>
 * 
 * <Button variant="outline" loading={isLoading} onPress={handleSubmit}>
 *   Soumettre
 * </Button>
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#AB8BFF'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`]
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  // Variants
  variant_primary: {
    backgroundColor: '#AB8BFF',
  },
  variant_secondary: {
    backgroundColor: '#D6C7FF',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#AB8BFF',
  },
  
  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: '#030014',
  },
  text_ghost: {
    color: '#AB8BFF',
  },
  text_outline: {
    color: '#AB8BFF',
  },
  
  textSize_sm: {
    fontSize: 14,
  },
  textSize_md: {
    fontSize: 16,
  },
  textSize_lg: {
    fontSize: 18,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});