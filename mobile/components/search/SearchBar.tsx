/**
 * Composant SearchBar
 * Principe SOLID: SRP - Barre de recherche complète
 * Atomic Design: Organism
 * Using NativeWind
 */

import { View } from 'react-native';
import React from 'react';
import { SearchInput } from './SearchInput';
import { FilterButton } from './FilterButton';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  filterCount?: number;
  placeholder?: string;
}

/**
 * Barre de recherche avec bouton filtres
 * 
 * @example
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onFilterPress={() => setShowFilters(true)}
 *   filterCount={3}
 * />
 */
export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  filterCount = 0,
  placeholder = 'Rechercher un candidat...'
}: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-3">
      <SearchInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
      <FilterButton
        onPress={onFilterPress}
        count={filterCount}
      />
    </View>
  );
}
