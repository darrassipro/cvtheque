/**
 * Composant CVSkills
 * Principe SOLID: SRP - Affichage compétences uniquement
 * Atomic Design: Molecule
 * Using NativeWind
 */
import { View, Text } from 'react-native';
import React from 'react';
import { Code2, Plus } from 'lucide-react-native';

export interface CVSkillsProps {
  skills: string[];
  maxVisible?: number;
  compact?: boolean;
}

export function CVSkills({ skills, maxVisible = 3, compact = false }: CVSkillsProps) {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return null;
  }

  const visibleSkills = skills.slice(0, maxVisible);
  const remainingCount = skills.length - maxVisible;

  if (compact) {
    return (
      <View className="mb-1.5">
        <View className="flex-row flex-wrap gap-1">
          {visibleSkills.map((skill, index) => (
            <View
              key={index}
              className="bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded"
            >
              <Text className="text-[10px] font-semibold text-orange-700">{skill}</Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded flex-row items-center gap-0.5">
              <Plus size={8} color="#6B7280" />
              <Text className="text-[10px] font-semibold text-gray-600">{remainingCount}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="mb-3">
      <View className="flex-row items-center gap-2 mb-2">
        <Code2 size={14} color="#F97316" strokeWidth={2.5} />
        <Text className="text-xs font-bold text-gray-700">COMPÉTENCES</Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {visibleSkills.map((skill, index) => (
          <View
            key={index}
            className="bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md"
          >
            <Text className="text-xs font-semibold text-orange-700">{skill}</Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md flex-row items-center gap-1">
            <Plus size={10} color="#6B7280" />
            <Text className="text-xs font-semibold text-gray-600">{remainingCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}