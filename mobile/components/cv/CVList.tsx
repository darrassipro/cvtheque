/**
 * Composant CVList
 * Principe SOLID: SRP - Affichage liste de CVs uniquement
 * Atomic Design: Organism
 * Using NativeWind
 */

import { FlatList, View, Text, ActivityIndicator, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { CVCardDisplay } from '@/types/cv.types';
import { CVCard } from './CVCard';
import { FileSearch, AlertCircle, Inbox, LayoutList, LayoutGrid } from 'lucide-react-native';

export interface CVListProps {
  cvs: CVCardDisplay[];
  loading?: boolean;
  error?: Error | null;
  onCVPress?: (cvId: string) => void;
  emptyMessage?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CVList({
  cvs,
  loading = false,
  error = null,
  onCVPress,
  emptyMessage = 'Aucun CV trouvé',
  refreshing = false,
  onRefresh
}: CVListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // État de chargement
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-orange-50">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <FileSearch size={48} color="#F97316" strokeWidth={2} />
        </Animated.View>
        <Text className="mt-4 text-base font-semibold text-gray-700">Chargement des CVs...</Text>
      </View>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-orange-50">
        <View className="bg-red-50 p-6 rounded-2xl border-l-4 border-red-500">
          <View className="flex-row items-center mb-2">
            <AlertCircle size={24} color="#DC2626" />
            <Text className="ml-2 text-lg font-bold text-red-700">Erreur</Text>
          </View>
          <Text className="text-sm text-red-600">{error.message}</Text>
        </View>
      </View>
    );
  }

  // Liste vide
  if (cvs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-orange-50">
        <Inbox size={64} color="#D1D5DB" strokeWidth={1.5} />
        <Text className="mt-4 text-base text-gray-500 font-semibold text-center">{emptyMessage}</Text>
      </View>
    );
  }

  // Toggle View Mode Button - Innovative floating design
  const ViewToggle = () => (
    <View className="px-3 py-2 bg-orange-50">
      <View className="flex-row justify-end">
        <View className="flex-row gap-1 bg-white rounded-full px-1.5 py-1.5 border-2 border-orange-500 shadow-lg">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full ${viewMode === 'list' ? 'bg-orange-600' : 'bg-transparent'}`}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
          >
            <LayoutList size={16} color={viewMode === 'list' ? '#fff' : '#F97316'} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full ${viewMode === 'grid' ? 'bg-orange-600' : 'bg-transparent'}`}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.7}
          >
            <LayoutGrid size={16} color={viewMode === 'grid' ? '#fff' : '#F97316'} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Liste des CVs
  return (
    <View className="flex-1 bg-orange-50">
      <ViewToggle />
      <FlatList
        data={cvs}
        keyExtractor={(item) => item.id}
        key={viewMode} // Force re-render on view mode change
        numColumns={viewMode === 'grid' ? 2 : 1}
        renderItem={({ item }) => (
          <CVCard
            cv={item}
            onPress={() => onCVPress?.(item.id)}
            viewMode={viewMode}
          />
        )}
        contentContainerStyle={{ 
          padding: viewMode === 'grid' ? 6 : 12,
          paddingBottom: 100 
        }}
        columnWrapperStyle={viewMode === 'grid' ? { gap: 6 } : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
              colors={['#F97316']}
            />
          ) : undefined
        }
      />
    </View>
  );
}
