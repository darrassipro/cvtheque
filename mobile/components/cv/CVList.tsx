/**
 * Composant CVList
 * Principe SOLID: SRP - Affichage liste de CVs uniquement
 * Atomic Design: Organism
 * Using NativeWind
 */

import { FlatList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import React from 'react';
import { CVCardDisplay } from '@/types/cv.types';
import { CVCard } from './CVCard';

export interface CVListProps {
  cvs: CVCardDisplay[];
  loading?: boolean;
  error?: Error | null;
  onCVPress?: (cv: CVCardDisplay) => void;
  emptyMessage?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Liste scrollable de CVs
 * Gère les états de chargement et d'erreur
 * 
 * @example
 * <CVList
 *   cvs={displayCVs}
 *   loading={loading}
 *   onCVPress={(cv) => navigate('Detail', { id: cv.id })}
 * />
 */
export function CVList({
  cvs,
  loading = false,
  error = null,
  onCVPress,
  emptyMessage = 'Aucun CV trouvé',
  refreshing = false,
  onRefresh
}: CVListProps) {
  // État de chargement
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#06B6D4" />
        <Text className="mt-4 text-base text-gray-500">Chargement des CVs...</Text>
      </View>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base text-red-500 text-center">❌ {error.message}</Text>
      </View>
    );
  }

  // Liste vide
  if (cvs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base text-gray-400 text-center">{emptyMessage}</Text>
      </View>
    );
  }

  // Liste des CVs
  return (
    <FlatList
      data={cvs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CVCard
          cv={item}
          onPress={() => onCVPress?.(item)}
        />
      )}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#06B6D4"
            colors={['#06B6D4']}
          />
        ) : undefined
      }
    />
  );
}
