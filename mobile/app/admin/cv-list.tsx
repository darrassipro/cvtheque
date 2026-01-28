import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useListCVsQuery } from '@/lib/services/cvApi';
import { CVSource, CVStatus } from '@/types/cv.types';

const STATUSES = [
  { label: 'All', value: '' },
  { label: 'Completed', value: CVStatus.COMPLETED },
  { label: 'Processing', value: CVStatus.PROCESSING },
  { label: 'Pending', value: CVStatus.PENDING },
  { label: 'Failed', value: CVStatus.FAILED },
];

const SOURCES = [
  { label: 'All Sources', value: '' },
  { label: 'User Upload', value: CVSource.USER_UPLOAD },
  { label: 'Bulk Upload', value: CVSource.SUPERADMIN_BULK },
];

export default function SuperadminCVListScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useListCVsQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter as any,
  });

  const cvs = data?.data || [];
  const pagination = data?.pagination;

  const handleCVPress = (cvId: string) => {
    router.push(`/cvs/${cvId}`);
  };

  const handleBulkUpload = () => {
    router.push('/admin/bulk-upload');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CVStatus.COMPLETED: return '#22c55e';
      case CVStatus.PROCESSING: return '#3b82f6';
      case CVStatus.PENDING: return '#f59e0b';
      case CVStatus.FAILED: return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === CVSource.SUPERADMIN_BULK) {
      return { label: 'Bulk', color: '#8b5cf6' };
    }
    return { label: 'User', color: '#06b6d4' };
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'CV List',
          headerRight: () => (
            <TouchableOpacity onPress={handleBulkUpload} style={{ marginRight: 16 }}>
              <Ionicons name="cloud-upload-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {/* Search Bar */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 48,
            }}
          >
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 16 }}
              placeholder="Search CVs..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Filters */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status.value}
                onPress={() => setStatusFilter(status.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: statusFilter === status.value ? '#3b82f6' : '#f3f4f6',
                }}
              >
                <ThemedText style={{ color: statusFilter === status.value ? '#fff' : '#374151' }}>
                  {status.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Source Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SOURCES.map((source) => (
              <TouchableOpacity
                key={source.value}
                onPress={() => setSourceFilter(source.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: sourceFilter === source.value ? '#8b5cf6' : '#f3f4f6',
                }}
              >
                <ThemedText style={{ color: sourceFilter === source.value ? '#fff' : '#374151' }}>
                  {source.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistics */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 16,
            gap: 12,
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12 }}>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Total CVs</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
              {pagination?.total || 0}
            </ThemedText>
          </View>
          <View style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12 }}>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Current Page</ThemedText>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
              {pagination?.page || 1}/{pagination?.totalPages || 1}
            </ThemedText>
          </View>
        </View>

        {/* CV List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
          ) : cvs.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="document-outline" size={64} color="#d1d5db" />
              <ThemedText style={{ marginTop: 16, color: '#6b7280' }}>No CVs found</ThemedText>
            </View>
          ) : (
            cvs.map((cv: any) => {
              const sourceBadge = getSourceBadge(cv.source || CVSource.USER_UPLOAD);
              const statusColor = getStatusColor(cv.status);

              return (
                <TouchableOpacity
                  key={cv.id}
                  onPress={() => handleCVPress(cv.id)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                        {cv.extractedData?.personalInfo?.fullName || cv.originalFileName}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                        {cv.extractedData?.personalInfo?.email || 'No email'}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View
                        style={{
                          backgroundColor: sourceBadge.color,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <ThemedText style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
                          {sourceBadge.label}
                        </ThemedText>
                      </View>
                      <View
                        style={{
                          backgroundColor: statusColor,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <ThemedText style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
                          {cv.status}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {cv.extractedData?.totalExperienceYears !== undefined && (
                      <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <ThemedText style={{ fontSize: 12, color: '#374151' }}>
                          {cv.extractedData.totalExperienceYears} years exp.
                        </ThemedText>
                      </View>
                    )}
                    {cv.extractedData?.seniorityLevel && (
                      <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <ThemedText style={{ fontSize: 12, color: '#374151' }}>
                          {cv.extractedData.seniorityLevel}
                        </ThemedText>
                      </View>
                    )}
                    {cv.metadata?.user && (
                      <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <ThemedText style={{ fontSize: 12, color: '#1e40af' }}>
                          {cv.metadata.user.firstName} {cv.metadata.user.lastName}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 16 }}>
            <TouchableOpacity
              onPress={() => setPage(page - 1)}
              disabled={page === 1}
              style={{
                backgroundColor: page === 1 ? '#f3f4f6' : '#3b82f6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <ThemedText style={{ color: page === 1 ? '#9ca3af' : '#fff' }}>Previous</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPage(page + 1)}
              disabled={!pagination.hasMore}
              style={{
                backgroundColor: !pagination.hasMore ? '#f3f4f6' : '#3b82f6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <ThemedText style={{ color: !pagination.hasMore ? '#9ca3af' : '#fff' }}>Next</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
