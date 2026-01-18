import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadCVMutation } from '@/lib/services/cvApi';
import { router } from 'expo-router';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader, 
  X, 
  Eye,
  RefreshCw,
  Home,
  Sparkles
} from 'lucide-react-native';

export default function UploadCVScreen() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadCV, { isLoading }] = useUploadCVMutation();
  const screenHeight = Dimensions.get('window').height;
  
  // Animation values
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for upload area
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Blurred Overlay */}
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

        {/* Modal Content - Bottom Sheet Style with Orange Top Border */}
        <SafeAreaView
          className="bg-white rounded-t-3xl overflow-hidden border-t-4 border-orange-500"
          style={{
            maxHeight: screenHeight * 0.9,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Close Button - Enhanced Design */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
              <View />
              <TouchableOpacity
                onPress={handleDismiss}
                className="bg-gray-100 rounded-full p-2.5 active:bg-gray-200"
                activeOpacity={0.7}
              >
                <X size={20} color="#374151" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="px-6 pb-8">
              {/* Header with Animated Sparkle */}
              <View className="mb-8">
                <View className="flex-row items-center mb-2">
                  <Text className="text-3xl font-bold text-gray-900">
                    Upload CV
                  </Text>
                  <Animated.View
                    style={{
                      marginLeft: 8,
                      transform: [{ rotate: sparkleRotate }],
                      opacity: sparkleOpacity,
                    }}
                  >
                    <Sparkles size={24} color="#F97316" fill="#F97316" />
                  </Animated.View>
                </View>
                <Text className="text-gray-600">
                  Select a PDF or Word document to upload and process
                </Text>
              </View>

              {/* Upload Area - Yellow/Jaune Dashed Border */}
              <Animated.View style={{ transform: [{ scale: selectedFile ? 1 : pulseAnim }] }}>
                <TouchableOpacity
                  className={`border-2 border-dashed rounded-xl p-8 mb-6 ${
                    selectedFile ? 'border-orange-500 bg-orange-50' : 'border-yellow-400 bg-yellow-50/30'
                  }`}
                  onPress={pickDocument}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View className="items-center">
                    {selectedFile ? (
                      <CheckCircle size={64} color="#F97316" />
                    ) : (
                      <Upload size={64} color="#FBBF24" />
                    )}
                    
                    <Text className={`text-lg font-semibold mt-4 ${
                      selectedFile ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {selectedFile ? 'File Selected' : 'Tap to Select File'}
                    </Text>
                    
                    <Text className="text-sm text-gray-500 mt-2 text-center">
                      {selectedFile
                        ? selectedFile.name
                        : 'Supported formats: PDF, DOC, DOCX'}
                    </Text>
                    
                    {selectedFile && (
                      <View className="mt-3 flex-row items-center bg-white px-3 py-1.5 rounded-full">
                        <FileText size={16} color="#F97316" />
                        <Text className="text-sm text-gray-600 ml-2 font-medium">
                          {(selectedFile.size / 1024).toFixed(0)} KB
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Instructions */}
              {!selectedFile && (
                <View className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl mb-6 border border-orange-100">
                  <View className="flex-row items-center mb-2">
                    <Sparkles size={18} color="#F97316" fill="#F97316" />
                    <Text className="text-sm font-bold text-orange-900 ml-2">
                      What happens after upload?
                    </Text>
                  </View>
                  <Text className="text-sm text-orange-800 mb-1">
                    • CV is automatically processed using AI
                  </Text>
                  <Text className="text-sm text-orange-800 mb-1">
                    • Personal information is extracted
                  </Text>
                  <Text className="text-sm text-orange-800 mb-1">
                    • Skills and experience are analyzed
                  </Text>
                  <Text className="text-sm text-orange-800">
                    • Results available in seconds
                  </Text>
                </View>
              )}

              {/* Upload Button with Icon */}
              {selectedFile && (
                <TouchableOpacity
                  className={`py-4 px-6 rounded-xl flex-row items-center justify-center ${
                    isLoading ? 'bg-orange-400' : 'bg-orange-600 active:bg-orange-700'
                  }`}
                  onPress={handleUpload}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="white" />
                      <Text className="text-white font-bold text-lg ml-3">
                        Uploading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Upload size={22} color="white" strokeWidth={2.5} />
                      <Text className="text-white font-bold text-lg ml-3">
                        Upload & Process CV
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Cancel Button with Icon */}
              {selectedFile && !isLoading && (
                <TouchableOpacity
                  className="mt-3 py-4 px-6 rounded-xl border-2 border-gray-300 bg-white flex-row items-center justify-center active:bg-gray-50"
                  onPress={() => setSelectedFile(null)}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={20} color="#374151" strokeWidth={2.5} />
                  <Text className="text-gray-700 font-semibold text-base ml-2">
                    Choose Different File
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