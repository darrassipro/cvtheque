/**
 * Composant CVSkills
 * Principe SOLID: SRP - Affichage compétences uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */

import { View } from 'react-native';
import React from 'react';
import { Badge } from '../ui/Badge';

export interface CVSkillsProps {
  skills: string[];
  maxVisible?: number;
}

/**
 * Liste des compétences du candidat
 * 
 * @example
 * <CVSkills
 *   skills={['React', 'Node.js', 'MongoDB']}
 *   maxVisible={3}
 * />
 */
export function CVSkills({ skills, maxVisible = 3 }: CVSkillsProps) {
  const visibleSkills = skills.slice(0, maxVisible);
  const remainingCount = skills.length - maxVisible;

  return (
    <View className="flex-row flex-wrap gap-2 mb-3">
      {visibleSkills.map((skill, index) => (
        <Badge key={index} variant="default" size="md">
          {skill}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="default" size="md">
          +{remainingCount}
        </Badge>
      )}
    </View>
  );
}
