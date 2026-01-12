import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetCVByIdQuery, useGetCVExtractedDataQuery } from '@/lib/services/cvApi';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react-native';

export default function CVDetailsScreen() {
  const { id } = useLocalSearchParams();
  const cvId = Array.isArray(id) ? id[0] : id;

  const {
    data: cvData,
    isLoading: cvLoading,
    refetch: refetchCV,
  } = useGetCVByIdQuery(cvId);

  const {
    data: extractedData,
    isLoading: extractedLoading,
    refetch: refetchExtracted,
  } = useGetCVExtractedDataQuery(cvId);

  const cv = cvData?.data;
  const extracted = extractedData?.data;
  const isProcessing = cv?.status === 'PROCESSING' || cv?.status === 'PENDING';

  // Auto-refresh while processing
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        refetchCV();
        refetchExtracted();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', Icon: CheckCircle, color: '#16A34A' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', Icon: Loader, color: '#2563EB' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', Icon: XCircle, color: '#DC2626' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', Icon: RefreshCw, color: '#CA8A04' },
    };

    const { bg, text, Icon, color } = config[status as keyof typeof config] || config.PENDING;

    return (
      <View className={`${bg} px-3 py-2 rounded-lg flex-row items-center`}>
        <Icon size={16} color={color} />
        <Text className={`${text} font-semibold ml-2`}>{status}</Text>
      </View>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => {
    if (!value) return null;
    
    return (
      <View className="flex-row items-start mb-4">
        <View className="w-10">
          <Icon size={20} color="#6B7280" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">{label}</Text>
          <Text className="text-base text-gray-900">{value}</Text>
        </View>
      </View>
    );
  };

  if (cvLoading && !cv) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading CV details...</Text>
      </View>
    );
  }

  if (!cv) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <XCircle size={64} color="#DC2626" />
        <Text className="text-gray-600 mt-4 text-lg">CV not found</Text>
        <TouchableOpacity
          className="mt-6 px-6 py-3 bg-blue-600 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={cvLoading || extractedLoading}
          onRefresh={() => {
            refetchCV();
            refetchExtracted();
          }}
        />
      }
    >
      {/* Header */}
      <View className="bg-white p-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <FileText size={32} color="#2563EB" />
          <StatusBadge status={cv.status} />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {cv.fileName}
        </Text>
        
        <View className="flex-row items-center text-sm text-gray-500">
          <Calendar size={14} color="#9CA3AF" />
          <Text className="ml-1 text-gray-500">
            Uploaded {new Date(cv.createdAt).toLocaleDateString()}
          </Text>
          {cv.fileSize && (
            <>
              <Text className="text-gray-400 mx-2">•</Text>
              <Text className="text-gray-500">
                {(cv.fileSize / 1024).toFixed(0)} KB
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Processing Status */}
      {isProcessing && (
        <View className="bg-blue-50 p-6 border-b border-blue-100">
          <View className="flex-row items-center mb-2">
            <Loader size={20} color="#2563EB" />
            <Text className="text-blue-900 font-semibold ml-2 text-lg">
              Processing CV...
            </Text>
          </View>
          <Text className="text-blue-800">
            Your CV is being analyzed. This usually takes a few seconds.
          </Text>
          <ActivityIndicator className="mt-4" color="#2563EB" />
        </View>
      )}

      {/* Failed Status */}
      {cv.status === 'FAILED' && (
        <View className="bg-red-50 p-6 border-b border-red-100">
          <View className="flex-row items-center mb-2">
            <XCircle size={20} color="#DC2626" />
            <Text className="text-red-900 font-semibold ml-2 text-lg">
              Processing Failed
            </Text>
          </View>
          <Text className="text-red-800 mb-4">
            {cv.errorMessage || 'Failed to process CV. Please try uploading again.'}
          </Text>
          <TouchableOpacity
            className="bg-red-600 py-3 rounded-lg"
            onPress={() => router.push('/upload')}
          >
            <Text className="text-white text-center font-semibold">
              Upload New CV
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Extracted Data */}
      {cv.status === 'COMPLETED' && extracted && (
        <View className="p-6">
          {/* Personal Information */}
          {extracted.personalInfo && (
            <View className="bg-white p-6 rounded-lg mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Personal Information
              </Text>
              <InfoRow
                icon={User}
                label="Full Name"
                value={extracted.personalInfo.fullName}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={extracted.personalInfo.email}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={extracted.personalInfo.phone}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={extracted.personalInfo.address}
              />
            </View>
          )}

          {/* Skills */}
          {extracted.skills && extracted.skills.length > 0 && (
            <View className="bg-white p-6 rounded-lg mb-4 shadow-sm">
              <View className="flex-row items-center mb-4">
                <Award size={24} color="#2563EB" />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Skills
                </Text>
              </View>
              <View className="flex-row flex-wrap">
                {extracted.skills.map((skill: string, index: number) => (
                  <View
                    key={index}
                    className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-blue-800 font-medium">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experience */}
          {extracted.experience && extracted.experience.length > 0 && (
            <View className="bg-white p-6 rounded-lg mb-4 shadow-sm">
              <View className="flex-row items-center mb-4">
                <Briefcase size={24} color="#2563EB" />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Experience
                </Text>
              </View>
              {extracted.experience.map((exp: any, index: number) => (
                <View key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <Text className="text-lg font-semibold text-gray-900">
                    {exp.position || exp.title}
                  </Text>
                  <Text className="text-base text-gray-700 mt-1">
                    {exp.company}
                  </Text>
                  {exp.duration && (
                    <Text className="text-sm text-gray-500 mt-1">
                      {exp.duration}
                    </Text>
                  )}
                  {exp.description && (
                    <Text className="text-sm text-gray-600 mt-2">
                      {exp.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {extracted.education && extracted.education.length > 0 && (
            <View className="bg-white p-6 rounded-lg mb-4 shadow-sm">
              <View className="flex-row items-center mb-4">
                <GraduationCap size={24} color="#2563EB" />
                <Text className="text-xl font-bold text-gray-900 ml-2">
                  Education
                </Text>
              </View>
              {extracted.education.map((edu: any, index: number) => (
                <View key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <Text className="text-lg font-semibold text-gray-900">
                    {edu.degree}
                  </Text>
                  <Text className="text-base text-gray-700 mt-1">
                    {edu.institution}
                  </Text>
                  {edu.year && (
                    <Text className="text-sm text-gray-500 mt-1">
                      {edu.year}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* No data available yet */}
      {cv.status === 'COMPLETED' && !extracted && (
        <View className="p-6">
          <View className="bg-yellow-50 p-6 rounded-lg">
            <Text className="text-yellow-900 font-semibold mb-2">
              No extracted data available
            </Text>
            <Text className="text-yellow-800">
              CV processing completed but no data was extracted.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
