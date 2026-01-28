import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGetCVByIdQuery, useGetCVExtractedDataQuery, useUpdateCVExtractedDataMutation } from '@/lib/services/cvApi';

export default function CVEditScreen() {
  const { id } = useLocalSearchParams();
  const cvId = Array.isArray(id) ? id[0] : id;

  const { data: cvData, isLoading: cvLoading } = useGetCVByIdQuery(cvId);
  const { data: extractedDataResponse, isLoading: extractedLoading } = useGetCVExtractedDataQuery(cvId);
  const [updateCV, { isLoading: isUpdating }] = useUpdateCVExtractedDataMutation();

  const cv = cvData?.data;
  const initialData = extractedDataResponse?.data;

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState('');
  const [totalExperienceYears, setTotalExperienceYears] = useState('');
  const [industry, setIndustry] = useState('');

  // Initialize form when data loads
  React.useEffect(() => {
    if (initialData) {
      setFullName(initialData.personalInfo?.fullName || '');
      setEmail(initialData.personalInfo?.email || '');
      setPhone(initialData.personalInfo?.phone || '');
      setCity(initialData.personalInfo?.city || '');
      setCountry(initialData.personalInfo?.country || '');
      setAge(initialData.age?.toString() || '');
      setSeniorityLevel(initialData.seniorityLevel || '');
      setTotalExperienceYears(initialData.totalExperienceYears?.toString() || '');
      setIndustry(initialData.industry || '');
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      const updates: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        country: country.trim(),
        seniorityLevel: seniorityLevel.trim(),
        industry: industry.trim(),
      };

      if (age.trim()) {
        updates.age = parseInt(age.trim(), 10);
      }

      if (totalExperienceYears.trim()) {
        updates.totalExperienceYears = parseInt(totalExperienceYears.trim(), 10);
      }

      await updateCV({ id: cvId, data: updates }).unwrap();

      Alert.alert('Success', 'CV data updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update CV data');
    }
  };

  if (cvLoading || extractedLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Edit CV Information',
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <ThemedText style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>
                  Save
                </ThemedText>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        {/* CV Metadata */}
        <View style={{ padding: 16, backgroundColor: '#f3f4f6' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Status</ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>
              {cv?.status}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Source</ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>
              {cv?.source === 'SUPERADMIN_BULK' ? 'Bulk Upload' : 'User Upload'}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Original File</ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
              {cv?.originalFileName}
            </ThemedText>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={{ padding: 16 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Personal Information
          </ThemedText>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Full Name *
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Email
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Phone
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
                City
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
                value={city}
                onChangeText={setCity}
                placeholder="City"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
                Country
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
                value={country}
                onChangeText={setCountry}
                placeholder="Country"
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Age
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Professional Information Section */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Professional Information
          </ThemedText>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Seniority Level
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Junior', 'Mid-Level', 'Senior', 'Expert'].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSeniorityLevel(level)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: seniorityLevel === level ? '#3b82f6' : '#f3f4f6',
                  }}
                >
                  <ThemedText style={{ color: seniorityLevel === level ? '#fff' : '#374151' }}>
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Total Experience (Years)
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={totalExperienceYears}
              onChangeText={setTotalExperienceYears}
              placeholder="Years of experience"
              keyboardType="numeric"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
              Industry
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              value={industry}
              onChangeText={setIndustry}
              placeholder="e.g., Technology, Finance, Healthcare"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isUpdating}
            style={{
              backgroundColor: isUpdating ? '#9ca3af' : '#22c55e',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Save Changes
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* View Full Details Button */}
        <View style={{ padding: 16, paddingTop: 0 }}>
          <TouchableOpacity
            onPress={() => router.push(`/cvs/${cvId}`)}
            style={{
              borderWidth: 1,
              borderColor: '#3b82f6',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>
              View Full CV Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
