/**
 * Screen Home (index.tsx)
 * Principe SOLID: SRP - Affichage de la CVThèque uniquement
 * Principe SOLID: DIP - Dépend des abstractions (hooks, services)
 * UI/UX Premium - Design moderne et épuré avec NativeWind
 */

import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Plus, Upload, FileText, Calendar, CheckCircle, Loader, XCircle, Clock, LogIn, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
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

  // If not authenticated, show welcome screen
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          {/* Welcome Section */}
          <View className="flex-1 justify-center items-center px-6 py-12">
            {/* Icon */}
            <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-8">
              <FileText size={48} color="#F97316" />
            </View>

            {/* Title */}
            <Text className="text-4xl font-bold text-slate-900 text-center mb-4">
              Welcome to CVThèque
            </Text>

            {/* Subtitle */}
            <Text className="text-lg text-slate-500 text-center mb-8 leading-6">
              AI-powered CV analysis and management for BenCenterServices
            </Text>

            {/* Features */}
            <View className="w-full bg-white rounded-2xl p-6 mb-8 border border-slate-200">
              <View className="gap-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-semibold">Smart Extraction</Text>
                    <Text className="text-slate-600 text-sm">AI extracts key info from your CV</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-semibold">Easy Management</Text>
                    <Text className="text-slate-600 text-sm">Organize and manage all your CVs</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-semibold">Instant Insights</Text>
                    <Text className="text-slate-600 text-sm">Get analysis in real-time</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleOpenAuth}
              className="w-full bg-orange-500 rounded-xl py-4 flex-row items-center justify-center gap-2"
              activeOpacity={0.8}
            >
              <LogIn size={20} color="#FFFFFF" />
              <Text className="text-white font-bold text-lg">Sign In or Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

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