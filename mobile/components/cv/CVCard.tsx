/**
 * Composant CVCard
 * Principe SOLID: SRP - Orchestration de l'affichage d'un CV
 * Principe SOLID: OCP - Extensible via composition
 * Atomic Design: Organism
 * Using NativeWind
 */

import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { CVCardDisplay } from '@/types/cv.types';
import { CVAvatar } from './CVAvatar';
import { CVInfo } from './CVInfo';
import { CVSkills } from './CVSkills';
import { CVLanguages } from './CVLanguages';
import { CVMetadata } from './CVMetadata';
import { CVActions } from './CVActions';

export interface CVCardProps {
  cv: CVCardDisplay;
  onPress?: () => void;
  showActions?: boolean;
}

/**
 * Card complète pour afficher un CV
 * Composée de sous-composants spécialisés
 * 
 * @example
 * <CVCard
 *   cv={cvDisplay}
 *   onPress={() => navigate('CVDetail', { id: cv.id })}
 *   showActions={true}
 * />
 */
export function CVCard({
  cv,
  onPress,
  showActions = true
}: CVCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mx-4 mb-4 border border-gray-200 shadow-sm"
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <View className="flex-row mb-4">
        {/* Avatar */}
        <CVAvatar photo={cv.photo} size={80} />

        {/* Info principale */}
        <View className="flex-1 ml-4">
          <CVInfo
            fullName={cv.fullName}
            position={cv.position}
          />

          {/* Métadonnées */}
          <CVMetadata
            experience={cv.experience}
            contractType={cv.contractType}
            workMode={cv.workMode}
          />
        </View>
      </View>

      {/* Langues */}
      <CVLanguages languages={cv.languages} />

      {/* Compétences */}
      <CVSkills skills={cv.mainSkills} />

      {/* Actions */}
      {showActions && (
        <CVActions
          onViewProfile={() => console.log('View profile', cv.id)}
        />
      )}
    </TouchableOpacity>
  );
}
