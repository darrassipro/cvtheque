/**
 * Composant FilterChip
 * Principe SOLID: SRP - Chip de filtre actif uniquement
 * Atomic Design: Atom
 * Using NativeWind
 */

import { TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { X } from 'lucide-react-native';
import { ActiveFilter } from '@/types/filter.types';

export interface FilterChipProps {
  filter: ActiveFilter;
  onRemove: (filterId: string) => void;
}

/**
 * Chip affichant un filtre actif avec bouton de suppression
 * 
 * @example
 * <FilterChip
 *   filter={{ id: '1', label: 'CDI', value: 'CDI' }}
 *   onRemove={(id) => removeFilter(id)}
 * />
 */
export function FilterChip({ filter, onRemove }: FilterChipProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-slate-100 border border-slate-200 py-1.5 pl-3 pr-2 rounded-full gap-1.5"
      onPress={() => onRemove(filter.id)}
      activeOpacity={0.8}
    >
      <Text className="text-xs text-slate-700 font-semibold">{filter.value}</Text>
      <X size={14} color="#64748B" />
    </TouchableOpacity>
  );
}
