/**
 * Composant CVLanguages
 * Principe SOLID: SRP - Affichage langues uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View, Text } from 'react-native';
import React from 'react';
import { Languages } from 'lucide-react-native';

export interface CVLanguagesProps {
  languages: string[];
}

/**
 * Liste des langues parlées par le candidat
 * 
 * @example
 * <CVLanguages
 *   languages={['Français (C2)', 'Anglais (B2)']}
 * />
 */
export function CVLanguages({ languages }: CVLanguagesProps) {
  return (
    <View className="flex-row items-center gap-1.5 mb-3">
      <Languages size={14} color="#6B7280" />
      <Text className="flex-1 text-xs text-gray-500" numberOfLines={2}>
        {languages.join(' • ')}
      </Text>
    </View>
  );
}
