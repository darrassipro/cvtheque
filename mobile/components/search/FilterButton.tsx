/**
 * Composant FilterButton
 * Principe SOLID: SRP - Bouton filtres uniquement
 * Atomic Design: Atom
 * Using NativeWind
 */

import { TouchableOpacity, Text, View } from 'react-native';
import React from 'react';
import { SlidersHorizontal } from 'lucide-react-native';

export interface FilterButtonProps {
  onPress: () => void;
  count?: number;
}

/**
 * Bouton pour ouvrir les filtres
 * Affiche le nombre de filtres actifs
 * 
 * @example
 * <FilterButton
 *   onPress={() => setShowFilters(true)}
 *   count={3}
 * />
 */
export function FilterButton({ onPress, count = 0 }: FilterButtonProps) {
  return (
    <TouchableOpacity
      className="w-12 h-12 bg-cyan-500 rounded-xl items-center justify-center"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <SlidersHorizontal size={24} color="#fff" />
      {count > 0 && (
        <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
