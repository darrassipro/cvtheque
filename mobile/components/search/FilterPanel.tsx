/**
 * Composant FilterPanel
 * Principe SOLID: SRP - Panneau de filtres uniquement
 * Atomic Design: Organism
 * Using NativeWind
 */

import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { ActiveFilter } from '@/types/filter.types';
import { FilterChip } from './FilterChip';

export interface FilterPanelProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll?: () => void;
}

/**
 * Panneau affichant les filtres actifs
 * 
 * @example
 * <FilterPanel
 *   activeFilters={activeFilters}
 *   onRemoveFilter={(id) => clearFilter(id)}
 *   onClearAll={clearAllFilters}
 * />
 */
export function FilterPanel({
  activeFilters,
  onRemoveFilter,
  onClearAll
}: FilterPanelProps) {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Filtres actifs ({activeFilters.length})
        </Text>
        {onClearAll && activeFilters.length > 0 && (
          <Text style={styles.clearAll} onPress={onClearAll}>
            Tout effacer
          </Text>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {activeFilters.map(filter => (
          <FilterChip
            key={filter.id}
            filter={filter}
            onRemove={onRemoveFilter}
          />
        ))}
      </ScrollView>
    </View>
  );
}
