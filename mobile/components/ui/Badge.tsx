/**
 * Composant Badge
 * Principe SOLID: SRP - Affichage d'un badge uniquement
 * Atomic Design: Atom
 * Using NativeWind with Orange, Dark Blue, Yellow palette
 */

import { View, Text } from 'react-native';
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Badge pour afficher des labels/tags
 * 
 * @example
 * <Badge variant="primary">CDI</Badge>
 * <Badge variant="accent" size="sm">Disponible</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md'
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-200 text-slate-900',
    primary: 'bg-orange-500 text-white',
    secondary: 'bg-blue-900 text-white',
    accent: 'bg-amber-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-amber-500 text-slate-900',
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
