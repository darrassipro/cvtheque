/**
 * SharingHistoryCard Component
 * Beautiful, minimalist card showing CV sharing history grouped by consultant
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react-native';
import { router } from 'expo-router';

interface SharedCV {
  id: string;
  fullName: string;
  position: string;
  photo: string;
}

interface SharingHistoryCardProps {
  consultantName: string;
  consultantEmail: string;
  sharedDate: string;
  cvs: SharedCV[];
}

export function SharingHistoryCard({
  consultantName,
  consultantEmail,
  sharedDate,
  cvs,
}: SharingHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(sharedDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-sm">
      {/* Header - Consultant Info */}
      <TouchableOpacity
        className="p-4 flex-row items-center justify-between active:bg-gray-50"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          {/* Avatar */}
          <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center mr-3">
            <User size={20} color="#fff" strokeWidth={2.5} />
          </View>

          {/* Consultant Details */}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {consultantName}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {consultantEmail}
            </Text>
            <View className="flex-row items-center mt-1">
              <Calendar size={11} color="#9CA3AF" strokeWidth={2} />
              <Text className="text-xs text-gray-400 ml-1">{formattedDate}</Text>
            </View>
          </View>

          {/* CV Count Badge */}
          <View className="bg-orange-100 px-3 py-1.5 rounded-full mr-2">
            <Text className="text-xs font-bold text-orange-600">
              {cvs.length} CV{cvs.length > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Expand Icon */}
          {expanded ? (
            <ChevronUp size={20} color="#F97316" strokeWidth={2.5} />
          ) : (
            <ChevronDown size={20} color="#9CA3AF" strokeWidth={2.5} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expandable CV List */}
      {expanded && (
        <View className="px-4 pb-3 border-t border-gray-100 bg-gray-50">
          <View className="pt-3 space-y-2">
            {cvs.map((cv, index) => (
              <TouchableOpacity
                key={cv.id}
                className="flex-row items-center bg-white rounded-xl p-3 border border-gray-100 active:bg-orange-50"
                onPress={() => router.push(`/profile/${cv.id}`)}
                activeOpacity={0.7}
              >
                {/* CV Photo */}
                <Image
                  source={{ uri: cv.photo }}
                  className="w-10 h-10 rounded-full mr-3"
                  defaultSource={require('@/assets/images/icon.png')}
                />

                {/* CV Info */}
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {cv.fullName}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {cv.position}
                  </Text>
                </View>

                {/* View Icon */}
                <View className="bg-orange-50 p-2 rounded-lg">
                  <FileText size={14} color="#F97316" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
