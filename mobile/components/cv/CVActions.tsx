/**
 * Composant CVActions
 * Principe SOLID: SRP - Boutons d'action uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { TouchableOpacity, Text, View } from 'react-native';
import React from 'react';
import { ChevronRight } from 'lucide-react-native';

export interface CVActionsProps {
  onViewProfile: () => void;
  onContact?: () => void;
}

/**
 * Boutons d'action pour un CV
 * 
 * @example
 * <CVActions
 *   onViewProfile={() => navigate('Profile')}
 *   onContact={() => openContact()}
 * />
 */
export function CVActions({ onViewProfile, onContact }: CVActionsProps) {
  return (
    <View className="flex-row gap-2.5">
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center bg-cyan-500 py-3.5 px-5 rounded-2xl gap-2 shadow-sm"
        onPress={onViewProfile}
        activeOpacity={0.8}
      >
        <Text className="text-white text-[15px] font-bold tracking-wide">Voir le profil</Text>
        <ChevronRight size={16} color="#fff" />
      </TouchableOpacity>

      {onContact && (
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-transparent border-2 border-cyan-500 py-3.5 px-5 rounded-2xl"
          onPress={onContact}
          activeOpacity={0.8}
        >
          <Text className="text-cyan-500 text-[15px] font-bold tracking-wide">
            Contacter
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
