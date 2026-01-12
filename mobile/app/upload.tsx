import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadCVMutation } from '@/lib/services/cvApi';
import { router } from 'expo-router';
import { Upload, FileText, CheckCircle, XCircle, Loader, X } from 'lucide-react-native';

export default function UploadCVScreen() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadCV, { isLoading }] = useUploadCVMutation();
  const screenHeight = Dimensions.get('window').height;

  const handleDismiss = () => {
    router.back();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('cv', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/pdf',
        name: selectedFile.name,
      } as any);

      const result = await uploadCV(formData).unwrap();
      
      Alert.alert(
        'Success',
        'CV uploaded successfully and is being processed',
        [
          {
            text: 'View Details',
            onPress: () => {
              setTimeout(() => {
                router.back();
                router.push(`/cvs/${result.data.id}`);
              }, 100);
            },
          },
          {
            text: 'Upload Another',
            onPress: () => {
              setSelectedFile(null);
            },
          },
          {
            text: 'Back to Home',
            onPress: () => {
              setSelectedFile(null);
              setTimeout(() => {
                router.back();
              }, 100);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.data?.message || 'Failed to upload CV');
    }
  };

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Blurred Overlay - allows dismissing by tapping background */}
        <BlurView 
          intensity={30}
          tint="light"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <TouchableOpacity 
            className="flex-1"
            activeOpacity={1}
            onPress={handleDismiss}
          />
        </BlurView>

        {/* Modal Content - Bottom Sheet Style */}
        <SafeAreaView
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{
            maxHeight: screenHeight * 0.9,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Close Button */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
              <View />
              <TouchableOpacity
                onPress={handleDismiss}
                className="p-2"
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="px-6 pb-8">
              {/* Header */}
              <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Upload CV
                </Text>
                <Text className="text-gray-600">
                  Select a PDF or Word document to upload and process
                </Text>
              </View>

              {/* Upload Area */}
              <TouchableOpacity
                className={`border-2 border-dashed rounded-lg p-8 mb-6 ${
                  selectedFile ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                }`}
                onPress={pickDocument}
                disabled={isLoading}
              >
                <View className="items-center">
                  {selectedFile ? (
                    <CheckCircle size={64} color="#2563EB" />
                  ) : (
                    <Upload size={64} color="#9CA3AF" />
                  )}
                  
                  <Text className={`text-lg font-semibold mt-4 ${
                    selectedFile ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {selectedFile ? 'File Selected' : 'Tap to Select File'}
                  </Text>
                  
                  <Text className="text-sm text-gray-500 mt-2 text-center">
                    {selectedFile
                      ? selectedFile.name
                      : 'Supported formats: PDF, DOC, DOCX'}
                  </Text>
                  
                  {selectedFile && (
                    <View className="mt-3 flex-row items-center">
                      <FileText size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Instructions */}
              {!selectedFile && (
                <View className="bg-blue-50 p-4 rounded-lg mb-6">
                  <Text className="text-sm font-semibold text-blue-900 mb-2">
                    What happens after upload?
                  </Text>
                  <Text className="text-sm text-blue-800 mb-1">
                    • CV is automatically processed using AI
                  </Text>
                  <Text className="text-sm text-blue-800 mb-1">
                    • Personal information is extracted
                  </Text>
                  <Text className="text-sm text-blue-800 mb-1">
                    • Skills and experience are analyzed
                  </Text>
                  <Text className="text-sm text-blue-800">
                    • Results available in seconds
                  </Text>
                </View>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <TouchableOpacity
                  className={`py-4 rounded-lg ${
                    isLoading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                  onPress={handleUpload}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="white" />
                      <Text className="text-white font-semibold text-lg ml-2">
                        Uploading...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      Upload & Process CV
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              {selectedFile && !isLoading && (
                <TouchableOpacity
                  className="mt-3 py-4 rounded-lg border border-gray-300"
                  onPress={() => setSelectedFile(null)}
                >
                  <Text className="text-gray-700 text-center font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
            </View>
    </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
