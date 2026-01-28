import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useListCVsQuery, useAssignCVsToConsultantMutation } from '@/lib/services/cvApi';

type AssignmentType = 'cv' | 'user-profile';

export default function ConsultantAssignmentScreen() {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('cv');
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [consultantId, setConsultantId] = useState('');
  const [listName, setListName] = useState('');

  const { data: cvsData, isLoading } = useListCVsQuery({
    page: 1,
    limit: 100,
  });

  const [assignCVs, { isLoading: isAssigning }] = useAssignCVsToConsultantMutation();

  const cvs = cvsData?.data || [];

  // Group CVs by user for user-profile view
  const userGroups = cvs.reduce((groups: any, cv: any) => {
    const userId = cv.userId || 'no-user';
    if (!groups[userId]) {
      groups[userId] = {
        userId,
        userName: cv.metadata?.user
          ? `${cv.metadata.user.firstName} ${cv.metadata.user.lastName}`
          : 'Bulk Upload (No User)',
        cvs: [],
      };
    }
    groups[userId].cvs.push(cv);
    return groups;
  }, {});

  const userGroupsArray = Object.values(userGroups);

  const handleToggleCV = (cvId: string) => {
    if (selectedCVs.includes(cvId)) {
      setSelectedCVs(selectedCVs.filter((id) => id !== cvId));
    } else {
      setSelectedCVs([...selectedCVs, cvId]);
    }
  };

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAssign = async () => {
    if (!consultantId.trim()) {
      Alert.alert('Error', 'Please enter consultant ID');
      return;
    }

    if (assignmentType === 'cv' && selectedCVs.length === 0) {
      Alert.alert('Error', 'Please select at least one CV');
      return;
    }

    if (assignmentType === 'user-profile' && selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user profile');
      return;
    }

    try {
      const payload: any = {
        consultantId: consultantId.trim(),
        assignmentType,
        name: listName.trim() || undefined,
      };

      if (assignmentType === 'cv') {
        payload.cvIds = selectedCVs;
      } else {
        payload.userIds = selectedUsers.filter(id => id !== 'no-user');
      }

      const result = await assignCVs(payload).unwrap();

      Alert.alert('Success', `${result.cvCount} CVs assigned to consultant`, [
        {
          text: 'OK',
          onPress: () => {
            setSelectedCVs([]);
            setSelectedUsers([]);
            setConsultantId('');
            setListName('');
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Assignment error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to assign CVs');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Assign CVs to Consultant',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        {/* Assignment Type Selector */}
        <View style={{ padding: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Assignment Type
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                setAssignmentType('cv');
                setSelectedCVs([]);
                setSelectedUsers([]);
              }}
              style={{
                flex: 1,
                backgroundColor: assignmentType === 'cv' ? '#3b82f6' : '#f3f4f6',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: assignmentType === 'cv' ? '#fff' : '#374151', fontWeight: '600' }}>
                By CV
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setAssignmentType('user-profile');
                setSelectedCVs([]);
                setSelectedUsers([]);
              }}
              style={{
                flex: 1,
                backgroundColor: assignmentType === 'user-profile' ? '#3b82f6' : '#f3f4f6',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: assignmentType === 'user-profile' ? '#fff' : '#374151', fontWeight: '600' }}>
                By User Profile
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultant ID Input */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Consultant ID
          </ThemedText>
          <TextInput
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
            }}
            placeholder="Enter consultant user ID"
            value={consultantId}
            onChangeText={setConsultantId}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Optional List Name */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            List Name (Optional)
          </ThemedText>
          <TextInput
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
            }}
            placeholder="e.g., Frontend Developers Q1 2026"
            value={listName}
            onChangeText={setListName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Selection Count */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ backgroundColor: '#dbeafe', borderRadius: 12, padding: 12 }}>
            <ThemedText style={{ color: '#1e40af', fontSize: 14 }}>
              {assignmentType === 'cv'
                ? `Selected: ${selectedCVs.length} CV(s)`
                : `Selected: ${selectedUsers.length} User Profile(s)`}
            </ThemedText>
          </View>
        </View>

        {/* CV Selection (By CV) */}
        {assignmentType === 'cv' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Select CVs
            </ThemedText>
            {isLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
            ) : (
              cvs.map((cv: any) => (
                <TouchableOpacity
                  key={cv.id}
                  onPress={() => handleToggleCV(cv.id)}
                  style={{
                    backgroundColor: selectedCVs.includes(cv.id) ? '#dbeafe' : '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: selectedCVs.includes(cv.id) ? 2 : 1,
                    borderColor: selectedCVs.includes(cv.id) ? '#3b82f6' : '#e5e7eb',
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: selectedCVs.includes(cv.id) ? '#3b82f6' : '#fff',
                      borderWidth: 2,
                      borderColor: selectedCVs.includes(cv.id) ? '#3b82f6' : '#d1d5db',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    {selectedCVs.includes(cv.id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
                      {cv.extractedData?.personalInfo?.fullName || cv.originalFileName}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {cv.extractedData?.personalInfo?.email || 'No email'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* User Profile Selection (By User) */}
        {assignmentType === 'user-profile' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 100 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Select User Profiles
            </ThemedText>
            {isLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
            ) : (
              userGroupsArray.map((group: any) => (
                <TouchableOpacity
                  key={group.userId}
                  onPress={() => handleToggleUser(group.userId)}
                  disabled={group.userId === 'no-user'}
                  style={{
                    backgroundColor: selectedUsers.includes(group.userId) ? '#dbeafe' : '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: selectedUsers.includes(group.userId) ? 2 : 1,
                    borderColor: selectedUsers.includes(group.userId) ? '#3b82f6' : '#e5e7eb',
                    opacity: group.userId === 'no-user' ? 0.5 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: selectedUsers.includes(group.userId) ? '#3b82f6' : '#fff',
                      borderWidth: 2,
                      borderColor: selectedUsers.includes(group.userId) ? '#3b82f6' : '#d1d5db',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    {selectedUsers.includes(group.userId) && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
                      {group.userName}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {group.cvs.length} CV(s)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Assign Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity
          onPress={handleAssign}
          disabled={isAssigning}
          style={{
            backgroundColor: isAssigning ? '#9ca3af' : '#22c55e',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          {isAssigning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Assign to Consultant
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
