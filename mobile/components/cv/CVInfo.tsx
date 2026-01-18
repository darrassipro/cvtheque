/**
 * Composant CVInfo
 * Principe SOLID: SRP - Affichage nom et poste uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 * ✅ Displays fullName and position correctly
 * ✅ Handles missing data with fallbacks
 * ✅ Truncates long text with ellipsis
 */

import { View, Text } from 'react-native';
import React from 'react';
import { Briefcase } from 'lucide-react-native';

export interface CVInfoProps {
  fullName: string;
  position: string;
}

export function CVInfo({ fullName, position }: CVInfoProps) {
  // Fallback values for missing data
  const displayName = fullName && fullName !== 'Name not extracted' 
    ? fullName 
    : 'Candidat';
  
  const displayPosition = position && position !== 'Position not extracted'
    ? position
    : 'Poste non spécifié';

  return (
    <View className="mb-0.5">
      {/* Full Name - Bold and dark */}
      <Text 
        className="text-sm font-bold text-gray-900 mb-0.5" 
        numberOfLines={1}
        allowFontScaling={false}
      >
        {displayName}
      </Text>
      
      {/* Position - Orange with briefcase icon */}
      <View className="flex-row items-center gap-1">
        <Briefcase size={11} color="#F97316" strokeWidth={2.5} />
        <Text 
          className="text-[11px] text-orange-600 font-bold flex-1" 
          numberOfLines={1}
          allowFontScaling={false}
        >
          {displayPosition}
        </Text>
      </View>
    </View>
  );
}