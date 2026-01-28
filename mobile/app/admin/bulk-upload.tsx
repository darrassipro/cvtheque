import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBulkUploadCVsMutation } from '@/lib/services/cvApi';

interface SelectedFile {
  name: string;
  uri: string;
  size: number;
  mimeType: string;
}

export default function BulkUploadScreen() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [bulkUpload, { isLoading }] = useBulkUploadCVsMutation();

  const handleSelectFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => ({
          name: asset.name,
          uri: asset.uri,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/pdf',
        }));
        setSelectedFiles([...selectedFiles, ...files]);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files');
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select at least one CV to upload');
      return;
    }

    try {
      const formData = new FormData();
      
      selectedFiles.forEach((file, index) => {
        formData.append('cvs', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      });

      const result = await bulkUpload(formData).unwrap();

      Alert.alert(
        'Upload Complete',
        `${result.queued} CVs queued for processing\n${result.failed} failed`,
        [
          {
            text: 'View Results',
            onPress: () => {
              // Show detailed results
              const detailedMessage = result.results
                .map((r) => `${r.fileName}: ${r.status}${r.error ? ` (${r.error})` : ''}`)
                .join('\n');
              Alert.alert('Upload Results', detailedMessage);
            },
          },
          {
            text: 'OK',
            onPress: () => {
              setSelectedFiles([]);
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      Alert.alert('Upload Failed', error?.data?.message || 'Failed to upload CVs');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Bulk Upload CVs',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        {/* Instructions */}
        <View style={{ padding: 16, backgroundColor: '#dbeafe', margin: 16, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={24} color="#1e40af" />
            <ThemedText style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1e40af' }}>
              Bulk Upload Instructions
            </ThemedText>
          </View>
          <ThemedText style={{ color: '#1e40af', fontSize: 14, lineHeight: 20 }}>
            • Select multiple CVs (PDF or DOCX){'\n'}
            • CVs will be processed automatically{'\n'}
            • No user account association{'\n'}
            • You can edit extracted data later
          </ThemedText>
        </View>

        {/* Select Files Button */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handleSelectFiles}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="folder-open-outline" size={24} color="#fff" />
            <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              Select CVs
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                Selected Files ({selectedFiles.length})
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#6b7280' }}>
                Total: {formatFileSize(totalSize)}
              </ThemedText>
            </View>

            {selectedFiles.map((file, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                    {file.name}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {formatFileSize(file.size)}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveFile(index)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <View style={{ padding: 16, marginTop: 24 }}>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9ca3af' : '#22c55e',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                  <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                    Upload {selectedFiles.length} CV{selectedFiles.length > 1 ? 's' : ''}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {selectedFiles.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="cloud-upload-outline" size={80} color="#d1d5db" />
            <ThemedText style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
              No files selected
            </ThemedText>
            <ThemedText style={{ marginTop: 8, fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32 }}>
              Tap "Select CVs" to choose multiple files for bulk upload
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
