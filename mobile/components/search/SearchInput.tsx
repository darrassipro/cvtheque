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
    <View className="flex-1 flex-row items-center bg-white border-2 border-slate-200 rounded-xl px-4 py-3 gap-3 shadow-sm">
      <Search size={20} color="#1E3A8A" />
      <TextInput
        className="flex-1 text-base text-slate-900 font-medium"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}
