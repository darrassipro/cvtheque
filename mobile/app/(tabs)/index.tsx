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
    router.push(`/cvs/${cvId}`);
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

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: CheckCircle, color: '#10B981', label: 'Completed' };
      case 'PROCESSING':
        return { icon: Loader, color: '#F59E0B', label: 'Processing' };
      case 'FAILED':
        return { icon: XCircle, color: '#EF4444', label: 'Failed' };
      default:
        return { icon: Clock, color: '#6B7280', label: 'Pending' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // If not authenticated, show welcome screen
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gradient-to-b from-cyan-50 to-white">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          {/* Welcome Section */}
          <View className="flex-1 justify-center items-center px-6 py-12">
            {/* Icon */}
            <View className="w-24 h-24 bg-cyan-100 rounded-full items-center justify-center mb-8">
              <FileText size={48} color="#06B6D4" />
            </View>

            {/* Title */}
            <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
              Welcome to CVThèque
            </Text>

            {/* Subtitle */}
            <Text className="text-lg text-gray-600 text-center mb-8 leading-6">
              AI-powered CV analysis and management for BenCenterServices
            </Text>

            {/* Features */}
            <View className="w-full bg-white rounded-2xl p-6 mb-8 border border-cyan-100">
              <View className="gap-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-cyan-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#06B6D4" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">Smart Extraction</Text>
                    <Text className="text-gray-600 text-sm">AI extracts key info from your CV</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-cyan-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#06B6D4" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">Easy Management</Text>
                    <Text className="text-gray-600 text-sm">Organize and manage all your CVs</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 bg-cyan-100 rounded-full items-center justify-center mt-1">
                    <CheckCircle size={16} color="#06B6D4" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">Instant Insights</Text>
                    <Text className="text-gray-600 text-sm">Get analysis in real-time</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleOpenAuth}
              className="w-full bg-cyan-500 active:bg-cyan-600 rounded-xl py-4 flex-row items-center justify-center gap-2"
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
        className="flex-row items-center justify-between px-5 py-4 border-b" 
        style={{ 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color={colors.primary} />
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            <Text className="text-base font-bold" style={{ color: colors.primary }}>
              {results.length}
            </Text> candidat{results.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        {query && (
          <Text className="text-[13px] italic" style={{ color: colors.textMuted }}>
            pour "{query}"
          </Text>
        )}
      </View>

      {/* CV List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4" style={{ color: colors.textSecondary }}>
              Chargement des CVs...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20 px-5">
            <XCircle size={48} color="#EF4444" />
            <Text className="font-semibold mt-4 text-center" style={{ color: colors.text }}>
              Échec du chargement
            </Text>
            <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>
              {error?.message || 'Une erreur est survenue'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-6 px-6 py-3 rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : results.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-5">
            <FileText size={64} color="#CBD5E1" />
            <Text className="font-semibold mt-6 text-lg" style={{ color: colors.text }}>
              {query ? 'Aucun CV trouvé' : 'Aucun CV pour le moment'}
            </Text>
            <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>
              {query 
                ? `Aucun résultat pour "${query}"`
                : '🔍 Aucun candidat ne correspond à votre recherche'
              }
            </Text>
            {!query && (
              <TouchableOpacity
                onPress={handleUploadPress}
                className="mt-6 px-8 py-4 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Upload size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base">
                  Uploader un CV
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Animated.View 
            className="px-5 pt-4 gap-3"
            style={{ opacity: fadeAnim }}
          >
            {results.map((cv: any) => {
              const statusDisplay = getStatusDisplay(cv.processingStatus);
              const StatusIcon = statusDisplay.icon;

              return (
                <TouchableOpacity
                  key={cv.id}
                  onPress={() => handleCVPress(cv.id)}
                  className="rounded-2xl p-4 border active:opacity-80"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                  activeOpacity={0.7}
                >
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                        {cv.fullName}
                      </Text>
                      <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                        {cv.position}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <StatusIcon 
                          size={14} 
                          color={statusDisplay.color}
                        />
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: statusDisplay.color }}
                        >
                          {statusDisplay.label}
                        </Text>
                      </View>
                    </View>
                    <FileText size={24} color={colors.textMuted} />
                  </View>

                  {/* Skills */}
                  {cv.topSkills && cv.topSkills.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-2">
                      {cv.topSkills.map((skill: string, index: number) => (
                        <View key={index} className="bg-cyan-50 px-3 py-1 rounded-full">
                          <Text className="text-xs text-cyan-700 font-medium">{skill}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Metadata */}
                  <View 
                    className="flex-row items-center gap-4 mt-3 pt-3 border-t"
                    style={{ borderTopColor: colors.border }}
                  >
                    <View className="flex-row items-center gap-1">
                      <Calendar size={14} color={colors.textMuted} />
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {formatDate(cv.uploadedAt)}
                      </Text>
                    </View>
                    {cv.experience && (
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {cv.experience}
                      </Text>
                    )}
                  </View>

                  {/* Processing message */}
                  {cv.processingStatus === 'PROCESSING' && (
                    <View className="mt-2">
                      <Text className="text-xs text-amber-600">
                        ⚡ Extraction IA en cours...
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
}