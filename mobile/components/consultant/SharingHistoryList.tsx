/**
 * SharingHistoryList Component
 * Smart grouping and display of CV sharing history
 */

import React, { useMemo } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SharingHistoryCard } from './SharingHistoryCard';
import { Inbox, History, FileText } from 'lucide-react-native';

interface ShareGroup {
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  sharedDate: string;
  cvs: Array<{
    id: string;
    fullName: string;
    position: string;
    photo: string;
  }>;
}

interface SharingHistoryListProps {
  cvs: any[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function SharingHistoryList({
  cvs,
  refreshing = false,
  onRefresh,
}: SharingHistoryListProps) {
  // Group CVs by consultant using sharing metadata
  const groupedShares = useMemo(() => {
    if (!cvs || cvs.length === 0) return [];

    // Group by consultant
    const groupMap = new Map<string, ShareGroup>();

    cvs.forEach((cv: any) => {
      const sharedWith = cv.metadata?.rawData?.sharedWith;
      const sharedAt = cv.metadata?.rawData?.sharedAt;

      if (!sharedWith) return; // Skip if no sharing metadata

      const consultantKey = sharedWith.id;

      if (!groupMap.has(consultantKey)) {
        groupMap.set(consultantKey, {
          consultantId: sharedWith.id,
          consultantName: `${sharedWith.firstName || ''} ${sharedWith.lastName || ''}`.trim() || sharedWith.email,
          consultantEmail: sharedWith.email || '',
          sharedDate: sharedAt || new Date().toISOString(),
          cvs: [],
        });
      }

      const group = groupMap.get(consultantKey)!;
      group.cvs.push({
        id: cv.id,
        fullName: cv.extractedData?.personalInfo?.fullName || cv.extractedData?.fullName || 'Unknown',
        position: cv.extractedData?.personalInfo?.position || cv.extractedData?.position || 'Professional',
        photo: cv.metadata?.rawData?.photo || cv.extractedData?.photo || cv.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent('CV')}&background=F97316&color=fff`,
      });

      // Keep the most recent share date
      if (sharedAt && new Date(sharedAt) > new Date(group.sharedDate)) {
        group.sharedDate = sharedAt;
      }
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(groupMap.values()).sort(
      (a, b) => new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
    );
  }, [cvs]);

  if (groupedShares.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="bg-orange-50 p-6 rounded-full mb-4">
          <Inbox size={48} color="#F97316" strokeWidth={1.5} />
        </View>
        <Text className="text-base text-gray-600 font-semibold text-center">
          Aucun partage pour le moment
        </Text>
        <Text className="text-sm text-gray-400 text-center mt-2">
          Utilisez le panneau ci-dessus pour partager des CVs
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        ) : undefined
      }
    >
      {/* Stats Header */}
      <View className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center gap-2 mb-2">
          <History size={18} color="#000" strokeWidth={2} />
          <Text className="text-black text-sm font-semibold">Total des partages</Text>
        </View>
        <View className="flex-row items-end mt-1">
          <FileText size={20} color="#000" strokeWidth={2} />
          <Text className="text-black text-3xl font-bold ml-2">{cvs.length}</Text>
          <Text className="text-black text-lg font-semibold ml-2 mb-1">
            CV{cvs.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Sharing History Cards */}
      {groupedShares.map((group, index) => (
        <SharingHistoryCard
          key={`${group.consultantId}-${index}`}
          consultantName={group.consultantName}
          consultantEmail={group.consultantEmail}
          sharedDate={group.sharedDate}
          cvs={group.cvs}
        />
      ))}
    </ScrollView>
  );
}
