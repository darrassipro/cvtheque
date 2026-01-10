/**
 * Composant SearchInput
 * Principe SOLID: SRP - Input de recherche uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View, TextInput } from 'react-native';
import React from 'react';
import { Search } from 'lucide-react-native';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * Champ de saisie pour la recherche
 * 
 * @example
 * <SearchInput
 *   value={query}
 *   onChangeText={setQuery}
 *   placeholder="Rechercher..."
 * />
 */
export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Rechercher...'
}: SearchInputProps) {
  return (
    <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-3 gap-3">
      <Search size={20} color="#6B7280" />
      <TextInput
        className="flex-1 text-base text-gray-900"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
