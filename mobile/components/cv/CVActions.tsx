/**
 * Composant CVActions
 * Principe SOLID: SRP - Boutons d'action uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { TouchableOpacity, Text, View } from 'react-native';
import React from 'react';
import { Eye, Mail } from 'lucide-react-native';

export interface CVActionsProps {
  onViewProfile: () => void;
  onContact?: () => void;
  compact?: boolean;
}

export function CVActions({ onViewProfile, onContact, compact = false }: CVActionsProps) {
  if (compact) {
    return (
      <View className="flex-row gap-1.5 pt-2 border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-orange-600 py-2 rounded-lg gap-1 active:bg-orange-700"
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          <Eye size={14} color="#fff" strokeWidth={2.5} />
          <Text className="text-white text-[11px] font-bold">Profil</Text>
        </TouchableOpacity>

        {onContact && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-white border-2 border-orange-600 py-2 rounded-lg gap-1 active:bg-orange-50"
            onPress={onContact}
            activeOpacity={0.8}
          >
            <Mail size={14} color="#F97316" strokeWidth={2.5} />
            <Text className="text-orange-600 text-[11px] font-bold">Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row gap-2.5 pt-3 border-t border-gray-100">
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center bg-orange-600 py-3 px-4 rounded-xl gap-2 active:bg-orange-700"
        onPress={onViewProfile}
        activeOpacity={0.8}
      >
        <Eye size={16} color="#fff" strokeWidth={2.5} />
        <Text className="text-white text-sm font-bold">Voir le profil</Text>
      </TouchableOpacity>

      {onContact && (
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-white border-2 border-orange-600 py-3 px-4 rounded-xl gap-2 active:bg-orange-50"
          onPress={onContact}
          activeOpacity={0.8}
        >
          <Mail size={16} color="#F97316" strokeWidth={2.5} />
          <Text className="text-orange-600 text-sm font-bold">
            Contacter
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}