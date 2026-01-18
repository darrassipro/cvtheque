/**
 * Composant CVAvatar
 * Principe SOLID: SRP - Affichage photo candidat uniquement
 * Atomic Design: Atom
 * Using NativeWind
 */

import { Image, View } from 'react-native';
import React from 'react';
import { User } from 'lucide-react-native';

export interface CVAvatarProps {
  photo: string;
  size?: number;
}

export function CVAvatar({ photo, size = 60 }: CVAvatarProps) {
  return (
    <View
      className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-0.5"
      style={{
        width: size + 2,
        height: size + 2,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          className="bg-white"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <View
          className="bg-gray-100 items-center justify-center"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        >
          <User size={size / 2} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
}