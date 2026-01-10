/**
 * Composant FilterModal
 * Modal pour afficher et gérer les filtres
 * Using NativeWind
 */

import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { X, Briefcase, Clock, Home } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export function FilterModal({ visible, onClose, onApplyFilters }: FilterModalProps) {
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [experienceMin, setExperienceMin] = useState<number>(0);
  const [experienceMax, setExperienceMax] = useState<number>(10);

  const contractOptions = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];
  const workModeOptions = ['Présentiel', 'Hybride', 'Remote'];
  const experienceOptions = [
    { label: 'Junior (0-2 ans)', min: 0, max: 2 },
    { label: 'Confirmé (3-5 ans)', min: 3, max: 5 },
    { label: 'Senior (6-10 ans)', min: 6, max: 10 },
    { label: 'Expert (10+ ans)', min: 10, max: 20 },
  ];

  const toggleContractType = (type: string) => {
    setContractTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleWorkMode = (mode: string) => {
    setWorkModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      contractTypes: contractTypes.length > 0 ? contractTypes : undefined,
      workMode: workModes.length > 0 ? workModes : undefined,
      experienceRange: experienceMin > 0 || experienceMax < 20
        ? { min: experienceMin, max: experienceMax }
        : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setContractTypes([]);
    setWorkModes([]);
    setExperienceMin(0);
    setExperienceMax(20);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        {/* Modal Content */}
        <View className="bg-white rounded-3xl w-full max-w-md" style={{ maxHeight: '85%' }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Filtres</Text>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center"
            >
              <X size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="px-5 py-4" 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* Type de Contrat */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Briefcase size={18} color="#06B6D4" />
                <Text className="text-base font-semibold text-gray-900">Type de contrat</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {contractOptions.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => toggleContractType(type)}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      contractTypes.includes(type)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        contractTypes.includes(type) ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mode de Travail */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Home size={18} color="#06B6D4" />
                <Text className="text-base font-semibold text-gray-900">Mode de travail</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {workModeOptions.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => toggleWorkMode(mode)}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      workModes.includes(mode)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        workModes.includes(mode) ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Expérience */}
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <Clock size={18} color="#06B6D4" />
                <Text className="text-base font-semibold text-gray-900">Expérience</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {experienceOptions.map((option) => {
                  const isSelected = experienceMin === option.min && experienceMax === option.max;
                  return (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() => {
                        setExperienceMin(option.min);
                        setExperienceMax(option.max);
                      }}
                      className={`px-4 py-2.5 rounded-xl border-2 ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 px-5 py-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 items-center justify-center"
            >
              <Text className="text-base font-bold text-gray-700">Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 py-3.5 rounded-xl bg-cyan-500 items-center justify-center shadow-sm"
            >
              <Text className="text-base font-bold text-white">Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
