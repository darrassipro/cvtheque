/**
 * Composant CVMetadata
 * Principe SOLID: SRP - Affichage métadonnées uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View, Text } from 'react-native';
import React from 'react';
import { Clock, Briefcase, Home } from 'lucide-react-native';

export interface CVMetadataProps {
  experience: number;
  contractType: string;
  workMode: string;
}

/**
 * Métadonnées du CV (expérience, contrat, mode de travail)
 * 
 * @example
 * <CVMetadata
 *   experience={5}
 *   contractType="CDI"
 *   workMode="Hybride"
 * />
 */
export function CVMetadata({
  experience,
  contractType,
  workMode
}: CVMetadataProps) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1.5">
        <Clock size={14} color="#6B7280" />
        <Text className="text-[13px] text-gray-500">{experience} ans d'exp.</Text>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Briefcase size={14} color="#6B7280" />
        <Text className="text-[13px] text-gray-500">{contractType}</Text>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Home size={14} color="#6B7280" />
        <Text className="text-[13px] text-gray-500">{workMode}</Text>
      </View>
    </View>
  );
}
