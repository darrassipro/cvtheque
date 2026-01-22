/**
 * Screen Consultant (explore.tsx)
 * Principe SOLID: SRP - Affichage des CVs partagés et gestion du partage
 * UI/UX Premium - Design moderne et épuré avec NativeWind
 */

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGetSharedWithMeQuery, useGetSharedByMeQuery, useShareWithConsultantMutation, useListCVsQuery } from '@/lib/services/cvApi';
import { useSearchUsersQuery } from '@/lib/services/userApi';
import { apiCVService } from '@/services/cv/cvService.api';
import { CVList } from '@/components/cv';
import { SharingHistoryList } from '@/components/consultant';
import Header from '@/components/ui/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { CheckCircle2, Circle, X, Search, Users, Share2, ChevronDown, UserCheck, MessageSquare, Package, PlusCircle, BarChart3 } from 'lucide-react-native';

export default function ConsultantScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { user } = useSelector((state: RootState) => state.auth);
  const isElevated = ['SUPERADMIN', 'ADMIN', 'MODERATOR'].includes(user?.role || '');

  // État local
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareConsultantSearch, setShareConsultantSearch] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [selectedCvIds, setSelectedCvIds] = useState<string[]>([]);
  const [shareConsultantName, setShareConsultantName] = useState('');
  const [shareConsultantDesc, setShareConsultantDesc] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'share'>('history'); // Tab state

  // Requêtes API
  const { data: sharedWithData, isLoading: isLoadingWith, isFetching: isFetchingWith, error: errorWith, refetch: refetchWith } = useGetSharedWithMeQuery(undefined, { skip: isElevated });
  const { data: sharedByData, isLoading: isLoadingBy, isFetching: isFetchingBy, error: errorBy, refetch: refetchBy } = useGetSharedByMeQuery(undefined, { skip: !isElevated });
  
  const data = isElevated ? sharedByData : sharedWithData;
  const isLoading = isElevated ? isLoadingBy : isLoadingWith;
  const isFetching = isElevated ? isFetchingBy : isFetchingWith;
  const error = isElevated ? errorBy : errorWith;
  const refetch = isElevated ? refetchBy : refetchWith;

  const { data: allCVsData } = useListCVsQuery(isElevated ? { limit: 100 } : undefined, { skip: !isElevated });
  
  const { data: consultantsData, isFetching: isSearchingConsultants } = useSearchUsersQuery(
    { search: shareConsultantSearch, limit: 10 },
    { skip: !shareConsultantSearch || shareConsultantSearch.length < 2 }
  );

  const [shareMutate, { isLoading: isSharing }] = useShareWithConsultantMutation();

  // Transformations de données
  const cvs = data?.data ?? [];
  const displayCVs = useMemo(() => {
    const cards = (cvs ?? [])
      .map((cv: any) => {
        if (!cv?.id) return null;
        try {
          return apiCVService.toCVCardDisplay(cv);
        } catch (err) {
          console.error('[ConsultantScreen] Failed to transform CV:', err);
          return null;
        }
      })
      .filter(Boolean);
    return cards;
  }, [cvs]);

  const allCVs = useMemo(() => allCVsData?.data ?? [], [allCVsData]);
  const allDisplayCVs = useMemo(
    () => (allCVs ?? []).map((cv: any) => apiCVService.toCVCardDisplay(cv)).filter(Boolean),
    [allCVs]
  );

  const toggleSelect = useCallback((cvId: string) => {
    setSelectedCvIds((prev) => prev.includes(cvId) ? prev.filter(id => id !== cvId) : [...prev, cvId]);
  }, []);

  const filteredCVs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return displayCVs;
    return displayCVs.filter((cv) => {
      const name = (cv?.fullName ?? '').toLowerCase();
      const position = (cv?.position ?? '').toLowerCase();
      return name.includes(q) || position.includes(q);
    });
  }, [displayCVs, query]);

  // Handlers
  const handleCVPress = (cvId: string, photo?: string) => {
    if (!cvId) {
      Alert.alert('Erreur', 'ID du CV manquant');
      return;
    }
    router.push({ pathname: `/profile/${cvId}`, params: { photo: photo || '' } });
  };

  const onRefresh = async () => {
    await refetch();
  };

  const handleShare = async () => {
    if (!selectedConsultant?.id) {
      Alert.alert('Consultant requis', 'Veuillez sélectionner un consultant');
      return;
    }
    if (selectedCvIds.length === 0) {
      Alert.alert('Aucun CV sélectionné', 'Sélectionnez au moins un CV à partager');
      return;
    }
    try {
      await shareMutate({
        consultantId: selectedConsultant.id,
        cvIds: selectedCvIds,
        name: shareConsultantName || undefined,
        description: shareConsultantDesc || undefined,
      }).unwrap();
      Alert.alert('Succès', `CVs partagés avec ${selectedConsultant.firstName} ${selectedConsultant.lastName}`);
      setSelectedCvIds([]);
      setSelectedConsultant(null);
      setShareConsultantSearch('');
      setShareConsultantName('');
      setShareConsultantDesc('');
      setShowSharePanel(false);
    } catch (err: any) {
      Alert.alert('Erreur', err?.data?.message || 'Partage impossible');
    }
  };

  // Loading state
  if (isLoading && !cvs.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-3 text-gray-600">Chargement...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <Header
        title="Consultant"
        subtitle={isElevated ? "Partage & Historique" : "Profils partagés"}
        showSearch={!isElevated}
        searchValue={query}
        onSearchChange={setQuery}
        showUpload={false}
        showProfile={true}
        showNotifications={true}
      />

      {/* Admin Panel - Tabs for Nouveau partage and Total des partages */}
      {isElevated && (
        <>
          {/* Tab Headers */}
          <View className="flex-row border-b border-slate-200 bg-white">
            {/* Total des partages Tab */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
                activeTab === 'history'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('history')}
              activeOpacity={0.7}
            >
              <BarChart3 size={16} color={activeTab === 'history' ? '#F97316' : '#94A3B8'} strokeWidth={2} />
              <Text className={`text-sm font-semibold ml-2 ${
                activeTab === 'history' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                Total des partages
              </Text>
              {cvs.length > 0 && (
                <View className="ml-2 bg-orange-600 rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-bold">{cvs.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Nouveau partage Tab */}
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
                activeTab === 'share'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab('share')}
              activeOpacity={0.7}
            >
              <PlusCircle size={16} color={activeTab === 'share' ? '#F97316' : '#94A3B8'} strokeWidth={2} />
              <Text className={`text-sm font-semibold ml-2 ${
                activeTab === 'share' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                Nouveau partage
              </Text>
              {selectedCvIds.length > 0 && (
                <View className="ml-2 bg-orange-600 rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-bold">{selectedCvIds.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Share Panel - Only show when sharing tab is active */}
          {activeTab === 'share' && (
            <View className="flex-1 bg-white">
              <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <PlusCircle size={20} color="#F97316" strokeWidth={2} />
                <Text className="text-base font-bold text-slate-900">Nouveau partage</Text>
              </View>
            </View>
            
            {/* Consultant Search */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-slate-700 mb-2">Consultant</Text>
              <View className="flex-row items-center border border-slate-300 rounded-xl px-3 py-2 bg-slate-50">
                <Search size={18} color="#64748B" />
                <TextInput
                  placeholder="Rechercher par nom ou email..."
                  value={shareConsultantSearch}
                  onChangeText={setShareConsultantSearch}
                  className="flex-1 ml-2 text-sm"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            
            {/* Search Results */}
            {shareConsultantSearch.length >= 2 && (
              <View className="bg-slate-50 border border-slate-200 rounded-xl mb-3 overflow-hidden">
                <View className="flex-row items-center gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
                  <MessageSquare size={14} color="#F97316" strokeWidth={2} />
                  <Text className="text-xs font-semibold text-slate-600">Résultats de recherche</Text>
                  {(consultantsData?.data || []).length > 0 && (
                    <Text className="text-xs font-bold text-orange-600 ml-auto">({(consultantsData?.data || []).length})</Text>
                  )}
                </View>
                {isSearchingConsultants ? (
                  <View className="p-4 items-center">
                    <ActivityIndicator size="small" color="#F97316" />
                  </View>
                ) : (consultantsData?.data || []).length > 0 ? (
                  <ScrollView style={{ maxHeight: 160 }}>
                    {(consultantsData?.data || []).map((user: any) => (
                      <TouchableOpacity
                        key={user.id}
                        className={`px-4 py-3 border-b border-slate-100 flex-row items-center justify-between active:bg-orange-50 ${
                          selectedConsultant?.id === user.id ? 'bg-orange-50' : 'bg-white'
                        }`}
                        onPress={() => {
                          setSelectedConsultant(user);
                          setShareConsultantSearch('');
                        }}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center flex-1 gap-3">
                          <UserCheck size={16} color="#F97316" strokeWidth={2} />
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-slate-900">
                              {user.firstName} {user.lastName}
                            </Text>
                            <Text className="text-xs text-slate-500">{user.email}</Text>
                          </View>
                        </View>
                        {selectedConsultant?.id === user.id && (
                          <CheckCircle2 size={18} color="#F97316" strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View className="p-4 items-center gap-2">
                    <Package size={24} color="#94A3B8" strokeWidth={2} />
                    <Text className="text-sm text-slate-500 text-center">Aucun consultant trouvé</Text>
                  </View>
                )}
              </View>
            )}

            {/* Selected Consultant */}
            {selectedConsultant && (
              <View className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 gap-3">
                  <UserCheck size={16} color="#F97316" strokeWidth={2} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">
                      {selectedConsultant.firstName} {selectedConsultant.lastName}
                    </Text>
                    <Text className="text-xs text-slate-600">{selectedConsultant.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedConsultant(null);
                    setShareConsultantSearch('');
                  }}
                  className="p-1"
                >
                  <X size={16} color="#F97316" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}

            {/* Optional Fields */}
            <View className="space-y-3 mb-3">
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">Nom de la liste (optionnel)</Text>
                <TextInput
                  placeholder="Ex: Profils seniors..."
                  value={shareConsultantName}
                  onChangeText={setShareConsultantName}
                  className="border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-sm"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">Description (optionnel)</Text>
                <TextInput
                  placeholder="Ajoutez une note..."
                  value={shareConsultantDesc}
                  onChangeText={setShareConsultantDesc}
                  className="border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-sm"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* CV Selection */}
            <View className="mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Package size={16} color="#F97316" strokeWidth={2} />
                <Text className="text-sm font-semibold text-slate-700">
                  CVs à partager ({selectedCvIds.length} sélectionné{selectedCvIds.length > 1 ? 's' : ''})
                </Text>
              </View>
              <ScrollView style={{ maxHeight: 200 }} className="border border-slate-200 rounded-xl bg-slate-50">
                <View className="flex-row items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200">
                  <ChevronDown size={14} color="#94A3B8" strokeWidth={2} />
                  <Text className="text-xs text-slate-600 font-medium">Cliquez pour sélectionner</Text>
                </View>
                {allDisplayCVs.map((cv) => {
                  const selected = selectedCvIds.includes(cv.id);
                  return (
                    <TouchableOpacity
                      key={cv.id}
                      className={`flex-row items-center gap-3 px-3 py-2.5 border-b border-slate-100 active:bg-orange-50 ${
                        selected ? 'bg-orange-50' : 'bg-white'
                      }`}
                      onPress={() => toggleSelect(cv.id)}
                      activeOpacity={0.7}
                    >
                      {selected ? (
                        <CheckCircle2 size={18} color="#F97316" strokeWidth={2.5} />
                      ) : (
                        <Circle size={18} color="#9CA3AF" strokeWidth={2} />
                      )}
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                          {cv.fullName || 'Unknown'}
                        </Text>
                        <Text className="text-xs text-slate-500" numberOfLines={1}>
                          {cv.position || ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {allDisplayCVs.length === 0 && (
                  <View className="p-4 items-center gap-2">
                    <Package size={24} color="#94A3B8" strokeWidth={2} />
                    <Text className="text-sm text-slate-500 text-center">Aucun CV disponible</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              className={`rounded-xl py-3 items-center ${
                isSharing || !selectedConsultant || selectedCvIds.length === 0
                  ? 'bg-slate-300'
                  : 'bg-orange-600 active:bg-orange-700'
              }`}
              onPress={handleShare}
              disabled={isSharing || !selectedConsultant || selectedCvIds.length === 0}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                {isSharing ? 'Partage en cours...' : 'Partager'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
            </View>
          )}
        </>
      )}

      {/* Stats Bar for Regular Users */}
      {!isElevated && (
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
          <View className="flex-row items-center gap-2">
            <Users size={16} color="#F97316" />
            <Text className="text-sm font-medium text-slate-600">
              <Text className="text-base font-bold text-slate-900">
                {cvs.length}
              </Text> CV{cvs.length > 1 ? 's' : ''} reçu{cvs.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Content: History for Admins, CV List for Users */}
      {isElevated ? (
        activeTab === 'history' && (
          <SharingHistoryList
            cvs={cvs}
            refreshing={isFetching}
            onRefresh={onRefresh}
          />
        )
      ) : (
        <CVList
          cvs={filteredCVs}
          loading={isFetching && !cvs.length}
          error={error as any}
          onCVPress={handleCVPress}
          refreshing={isFetching}
          onRefresh={onRefresh}
          emptyMessage={
            query
              ? `Aucun résultat pour "${query}"`
              : 'Aucun profil partagé pour le moment'
          }
        />
      )}
    </View>
  );
}
