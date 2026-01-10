/**
 * Composant CVInfo
 * Principe SOLID: SRP - Affichage nom et poste uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View, Text } from 'react-native';
import React from 'react';

export interface CVInfoProps {
  fullName: string;
  position: string;
}

/**
 * Informations principales du candidat
 * 
 * @example
 * <CVInfo
 *   fullName="Sarah Martinez"
 *   position="Développeuse Full Stack"
 * />
 */
export function CVInfo({ fullName, position }: CVInfoProps) {
  return (
    <View className="mb-2">
      <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={1}>
        {fullName}
      </Text>
      <Text className="text-base text-cyan-500 font-semibold" numberOfLines={1}>
        {position}
      </Text>
    </View>
  );
}
