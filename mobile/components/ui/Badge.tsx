/**
 * Composant Badge
 * Principe SOLID: SRP - Affichage d'un badge uniquement
 * Atomic Design: Atom
 * Using NativeWind with cyan/yellow/gray palette
 */

import { View, Text } from 'react-native';
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Badge pour afficher des labels/tags
 * 
 * @example
 * <Badge variant="primary">CDI</Badge>
 * <Badge variant="success" size="sm">Disponible</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md'
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-900',
    primary: 'bg-cyan-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-400 text-gray-900',
    error: 'bg-red-500 text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <View className={`rounded-2xl self-start ${sizeClasses[size]} ${variantClasses[variant]}`}>
      <Text className={`font-semibold ${textSizeClasses[size]} ${variantClasses[variant]}`}>
        {children}
      </Text>
    </View>
  );
}
