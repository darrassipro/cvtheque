/**
 * Composant CVAvatar
 * Principe SOLID: SRP - Affichage photo candidat uniquement
 * Atomic Design: Atom
 * Using NativeWind
 */

import { Image } from 'react-native';
import React from 'react';

export interface CVAvatarProps {
  photo: string;
  size?: number;
}

/**
 * Photo du candidat
 * 
 * @example
 * <CVAvatar photo="https://..." size={80} />
 */
export function CVAvatar({ photo, size = 60 }: CVAvatarProps) {
  return (
    <Image
      source={{ uri: photo }}
      className="border-2 border-cyan-200"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
