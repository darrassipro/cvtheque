/**
 * Composant CVCard
 * Principe SOLID: SRP - Orchestration de l'affichage d'un CV
 * Principe SOLID: OCP - Extensible via composition
 * Atomic Design: Organism
 * Using NativeWind
 */

import { View, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { CVCardDisplay } from '@/types/cv.types';
import { CVAvatar } from './CVAvatar';
import { CVInfo } from './CVInfo';
import { CVSkills } from './CVSkills';
import { CVLanguages } from './CVLanguages';
import { CVMetadata } from './CVMetadata';
import { CVActions } from './CVActions';
import { Clock, Monitor, Eye,FileText } from 'lucide-react-native';

export interface CVCardProps {
  cv: CVCardDisplay;
  onPress?: () => void;
  showActions?: boolean;
  viewMode?: 'list' | 'grid';
}

export function CVCard({
  cv,
  onPress,
  showActions = true,
  viewMode = 'list'
}: CVCardProps) {
  // Grid view - compact vertical card
  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        className="flex-1 bg-white rounded-lg p-2.5 mb-1.5 border-t-4 border-orange-500 shadow-sm active:shadow-md"
        onPress={onPress}
        activeOpacity={0.95}
        style={{
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Avatar centré */}
        <View className="items-center mb-1.5">
          <CVAvatar photo={cv.photo} size={48} />
        </View>

        {/* Info */}
        <Text className="text-xs font-bold text-gray-900 text-center mb-0.5" numberOfLines={1}>
          {cv.fullName}
        </Text>
        <Text className="text-[10px] text-orange-600 font-semibold text-center mb-1.5" numberOfLines={1}>
          {cv.position}
        </Text>

        {/* All metadata shown compactly */}
        <View className="gap-1 mb-1.5">
          <View className="flex-row items-center justify-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
            <Clock size={9} color="#F97316" strokeWidth={2.5} />
            <Text className="text-[10px] font-semibold text-gray-700">{typeof cv.experience === 'number' ? `${cv.experience}a` : cv.experience}</Text>
          </View>
          <View className="flex-row items-center justify-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
            <FileText size={9} color="#F97316" strokeWidth={2.5} />
            <Text className="text-[10px] font-semibold text-gray-700" numberOfLines={1}>{cv.contractType}</Text>
          </View>
          <View className="flex-row items-center justify-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
            <Monitor size={9} color="#F97316" strokeWidth={2.5} />
            <Text className="text-[10px] font-semibold text-gray-700" numberOfLines={1}>{cv.workMode}</Text>
          </View>
        </View>

        {/* Action button */}
        <TouchableOpacity
          className="bg-orange-600 py-1.5 rounded-md flex-row items-center justify-center gap-0.5 active:bg-orange-700"
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Eye size={12} color="#fff" strokeWidth={2.5} />
          <Text className="text-white text-[10px] font-bold">Voir</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // List view - full horizontal card
  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-3 mb-2 border-t-4 border-orange-500 shadow-sm active:shadow-md"
      onPress={onPress}
      activeOpacity={0.95}
      disabled={!onPress}
      style={{
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-row mb-2">
        {/* Avatar */}
        <CVAvatar photo={cv.photo} size={56} />

        {/* Info principale */}
        <View className="flex-1 ml-2.5">
          <CVInfo
            fullName={cv.fullName}
            position={cv.position}
          />

          {/* All Métadonnées shown */}
          <View className="flex-row flex-wrap gap-1 mt-1">
            <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
              <Clock size={10} color="#F97316" strokeWidth={2.5} />
              <Text className="text-[10px] font-semibold text-gray-700">{typeof cv.experience === 'number' ? `${cv.experience} ans` : cv.experience}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
              <FileText size={10} color="#F97316" strokeWidth={2.5} />
              <Text className="text-[10px] font-semibold text-gray-700">{cv.contractType}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
              <Monitor size={10} color="#F97316" strokeWidth={2.5} />
              <Text className="text-[10px] font-semibold text-gray-700">{cv.workMode}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Langues - inline compact */}
      <CVLanguages languages={cv.languages} compact={true} />

      {/* Compétences - compact */}
      <CVSkills skills={cv.mainSkills} maxVisible={5} compact={true} />

      {/* Actions */}
      {showActions && (
        <CVActions
          onViewProfile={() => router.push(`/profile/${cv.id}`)}
          compact={true}
        />
      )}
    </TouchableOpacity>
  );
}
