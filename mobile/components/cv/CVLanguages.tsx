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
  compact?: boolean;
}

export function CVLanguages({ languages, compact = false }: CVLanguagesProps) {
  if (!languages || !Array.isArray(languages) || languages.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <View className="flex-row items-center gap-1 mb-1.5 bg-blue-50 px-1.5 py-1 rounded">
        <Languages size={10} color="#3B82F6" strokeWidth={2.5} />
        <Text className="flex-1 text-[10px] text-blue-700 font-semibold" numberOfLines={1}>
          {languages.slice(0, 2).join(' • ')}
          {languages.length > 2 && ` +${languages.length - 2}`}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-2">
      <View className="flex-row items-center gap-2 mb-1.5">
        <Languages size={14} color="#3B82F6" strokeWidth={2.5} />
        <Text className="text-xs font-bold text-gray-700">LANGUES</Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {languages.map((lang, index) => (
          <View
            key={index}
            className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md"
          >
            <Text className="text-xs font-semibold text-blue-700">{lang}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}