/**
 * Screen Home (index.tsx)
 * Principe SOLID: SRP - Affichage de la CVThèque uniquement
 * Principe SOLID: DIP - Dépend des abstractions (hooks, services)
 * UI/UX Premium - Design moderne et épuré avec NativeWind
 */

import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Upload, FileText, Calendar, CheckCircle, Loader, XCircle, Clock, LogIn, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useCVData } from '@/hooks/useCVData';
import { useCVFilters } from '@/hooks/useCVFilters';
import { useSearch } from '@/hooks/useSearch';
import Header from '@/components/ui/Header';
import { FilterPanel, FilterModal } from '@/components/search';
import { CVAvatar, CVInfo, CVSkills, CVLanguages, CVMetadata, CVActions, CVList } from '@/components/cv';
import { clearCVCache } from '@/lib/utils/cacheUtils';
import type { CVCardDisplay } from '@/types/cv.types';

/**
 * Écran principal - CVThèque Premium
 * Design épuré avec liste de CVs, recherche, filtres et animations subtiles
 */
export default function HomeScreen() {
  // État local
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Check authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Hook 1: Récupération des CVs via le service API
  const {
    cvs,
    displayCVs,
    loading,
    error,
    refetch
  } = useCVData();

  // Hook 2: Gestion des filtres
  const {
    filteredCVs,
    filterState,
    setFilter,
    clearFilter,
    clearAllFilters
  } = useCVFilters({ cvs: displayCVs });

  // Hook 3: Recherche avec debounce
  const {
    query,
    setQuery,
    results
  } = useSearch(
    filteredCVs,
    ['fullName', 'position'],
    300
  );

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Navigate to CV details
  const handleCVPress = (cvId: string) => {
    router.push(`/profile/${cvId}`);
  };

  // Navigate to upload
  const handleUploadPress = () => {
    router.push('/upload');
  };

  // Open auth modal
  const handleOpenAuth = () => {
    router.push('/auth-modal');
  };

  // Toggle filtres
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Appliquer les filtres depuis le modal
  const handleApplyFilters = (filters: any) => {
    if (filters.contractTypes) {
      setFilter('contractTypes', filters.contractTypes);
    }
    if (filters.workMode) {
      setFilter('workMode', filters.workMode);
    }
    if (filters.experienceRange) {
      setFilter('experienceRange', filters.experienceRange);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Clear RTK Query cache to force fresh data from server
    clearCVCache();
    await refetch();
    setRefreshing(false);
  };

  // Refetch when screen gains focus to reflect latest data
  useFocusEffect(
    useCallback(() => {
      // Force fresh data on focus
      clearCVCache();
      refetch();
      return () => {};
    }, [refetch])
  );

  // Animation du header au scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 140],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Modular Header Component */}
      <Header
        title="CVThèque"
        subtitle="BenCenterServices"
        showSearch={true}
        searchValue={query}
        onSearchChange={setQuery}
        onFilterPress={handleToggleFilters}
        filterCount={filterState.appliedCount}
        showNotifications={true}
        showProfile={true}
        showUpload={true}
        onUploadPress={handleUploadPress}
        opacity={headerOpacity}
        height={headerHeight}
      />

      {/* Filter Panel */}
      {filterState.appliedCount > 0 && (
        <FilterPanel
          activeFilters={filterState.activeFilters}
          onRemoveFilter={(id) => clearFilter(id as any)}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Stats Bar */}
      <View 
        className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-200"
      >
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color="#F97316" />
          <Text className="text-sm font-medium text-slate-600">
            <Text className="text-base font-bold text-slate-900">
              {results.length}
            </Text> candidat{results.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        {query && (
          <Text className="text-[13px] italic text-slate-500">
            pour "{query}"
          </Text>
        )}
      </View>

      {/* CV List */}
      <CVList
        cvs={results}
        loading={loading}
        error={error}
        onCVPress={handleCVPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
        emptyMessage={
          query 
            ? `Aucun résultat pour "${query}"`
            : '🔍 Aucun candidat ne correspond à votre recherche'
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
}