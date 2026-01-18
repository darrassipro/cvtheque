/**
 * Composant CVMetadata
 * Principe SOLID: SRP - Affichage métadonnées uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View, Text } from 'react-native';
import React from 'react';
import { Clock, FileText, Monitor } from 'lucide-react-native';

export interface CVMetadataProps {
  experience: number;
  contractType: string;
  workMode: string;
  compact?: boolean;
}

export function CVMetadata({
  experience,
  contractType,
  workMode,
  compact = false
}: CVMetadataProps) {
  if (compact) {
    return (
      <View className="flex-row flex-wrap gap-1">
        <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
          <Clock size={10} color="#F97316" strokeWidth={2.5} />
          <Text className="text-xs font-semibold text-gray-700">{experience}a</Text>
        </View>
        <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
          <FileText size={10} color="#F97316" strokeWidth={2.5} />
          <Text className="text-xs font-semibold text-gray-700">{contractType}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg">
        <Clock size={12} color="#F97316" strokeWidth={2.5} />
        <Text className="text-xs font-semibold text-gray-700">{experience} ans</Text>
      </View>

      <View className="flex-row items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg">
        <FileText size={12} color="#F97316" strokeWidth={2.5} />
        <Text className="text-xs font-semibold text-gray-700">{contractType}</Text>
      </View>

      <View className="flex-row items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg">
        <Monitor size={12} color="#F97316" strokeWidth={2.5} />
        <Text className="text-xs font-semibold text-gray-700">{workMode}</Text>
      </View>
    </View>
  );
}
