/**
 * Screen Home (index.tsx)
 * Principe SOLID: SRP - Affichage de la CVThèque uniquement
 * Principe SOLID: DIP - Dépend des abstractions (hooks, services)
 * UI/UX Premium - Design moderne et épuré avec NativeWind
 */

import { View, Text, Animated, RefreshControl } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react-native';
import Header from '@/components/ui/Header';
import { FilterPanel, FilterModal } from '@/components/search';
import { CVList } from '@/components/cv';
import { useCVData } from '@/hooks/useCVData';
import { useCVFilters } from '@/hooks/useCVFilters';
import { useSearch } from '@/hooks/useSearch';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Écran principal - CVThèque Premium
 * Design épuré avec animations subtiles et UX soignée
 */
export default function HomeScreen() {
  // État local
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Hook 1: Récupération des CVs
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

  // Handler pour ouvrir un CV
  const handleCVPress = (cv: any) => {
    console.log('Open CV:', cv.id);
    // Navigation future: router.push(`/cv/${cv.id}`)
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
    await refetch();
    setRefreshing(false);
  };

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
    <View className="flex-1 bg-white">
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
      <View className="flex-row items-center justify-between px-5 py-4 border-b" 
        style={{ 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}>
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color={colors.primary} />
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            <Text className="text-base font-bold" style={{ color: colors.primary }}>{results.length}</Text> candidat{results.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        {query && (
          <Text className="text-[13px] italic" style={{ color: colors.textMuted }}>
            pour "{query}"
          </Text>
        )}
      </View>

      {/* CV List - Now properly without nested ScrollView */}
      <View className="flex-1">
        <CVList
          cvs={results}
          loading={loading}
          error={error}
          onCVPress={handleCVPress}
          emptyMessage="🔍 Aucun candidat ne correspond à votre recherche"
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
}