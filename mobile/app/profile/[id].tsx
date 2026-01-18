import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  Building2,
  ArrowLeft,
  Trophy,
  Zap,
  Globe,
  BookOpen,
  CheckCircle,
  Lightbulb,
} from 'lucide-react-native';
import { useGetCVByIdQuery } from '@/lib/services/cvApi';

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams();
  const profileId = Array.isArray(id) ? id[0] : id;

  const {
    data: cvData,
    isLoading,
    error,
    refetch,
  } = useGetCVByIdQuery(profileId);

  const [refreshing, setRefreshing] = React.useState(false);

  const cv = cvData?.data;
  const extracted = cv?.extractedData;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Log for debugging
  React.useEffect(() => {
    if (cv) {
      console.log('[Profile] CV loaded:', {
        id: cv.id?.substring(0, 8),
        status: cv.status,
        originalFileName: cv.originalFileName,
        hasExtractedData: !!extracted,
        extractedDataKeys: extracted ? Object.keys(extracted) : [],
        hasExperience: extracted?.experience?.length || 0,
        hasEducation: extracted?.education?.length || 0,
        hasSkills: extracted?.skills?.length || 0,
      });
    }
  }, [cv, extracted]);

  if (isLoading && !cv) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (error && !cv) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-600 text-center mb-4">Error loading profile</Text>
        <TouchableOpacity
          className="px-6 py-3 bg-orange-600 rounded-lg"
          onPress={() => {
            setRefreshing(false);
            refetch();
          }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cv) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg mb-4">Profile not found</Text>
        <TouchableOpacity
          className="px-6 py-3 bg-orange-600 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle missing or incomplete extracted data
  const hasData = extracted && (
    extracted.personalInfo || 
    (extracted.experience && extracted.experience.length > 0) ||
    (extracted.education && extracted.education.length > 0) ||
    (extracted.skills && extracted.skills.length > 0)
  );

  // Robust data extraction with fallbacks - declare arrays first
  const experience = extracted?.experience || [];
  const education = extracted?.education || [];
  const skills = extracted?.skills || [];
  const languages = extracted?.languages || [];
  const certifications = extracted?.certifications || [];
  const internships = extracted?.internships || [];
  const totalExperience = extracted?.totalExperienceYears || 0;
  const seniorityLevel = extracted?.seniorityLevel || 'N/A';
  const industry = extracted?.industry || '';
  const keywords = extracted?.keywords || [];
  
  // Then extract personal info with fallbacks
  const personalInfo = extracted?.personalInfo || {};
  const fullName = personalInfo.fullName || cv.originalFileName?.replace(/\.[^/.]+$/, '') || 'Unknown';
  const position = personalInfo.position || experience[0]?.jobTitle || experience[0]?.position || 'Professional';
  const email = personalInfo.email || '';
  const phone = personalInfo.phone || '';
  const location = personalInfo.address || [personalInfo.city, personalInfo.country].filter(Boolean).join(', ') || personalInfo.location || '';
  
  const isProcessing = cv.status === 'PROCESSING' || cv.status === 'PENDING';
  const isFailed = cv.status === 'FAILED';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <TouchableOpacity
          className="flex-row items-center gap-2 p-4"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#F97316" />
          <Text className="text-orange-600 font-semibold">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section with gradient background */}
      <View className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 py-8">
        <View className="items-center">
          {/* Avatar */}
          {cv.photoUrl ? (
            <Image
              source={{ uri: cv.photoUrl }}
              className="w-28 h-28 rounded-full border-4 border-white mb-4"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-4 border-white shadow-lg mb-4">
              <Text className="text-5xl font-bold text-orange-500">
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text className="text-3xl font-bold text-white text-center mb-2">
            {fullName}
          </Text>

          {/* Position */}
          <View className="bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
            <Text className="text-lg font-semibold text-white text-center">
              {position}
            </Text>
          </View>

          {/* Key Metrics */}
          {totalExperience > 0 && (
            <View className="flex-row gap-4 mt-4">
              <View className="bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                <Text className="text-xs text-white opacity-80">Experience</Text>
                <Text className="text-lg font-bold text-white">{totalExperience}y</Text>
              </View>
              {seniorityLevel && seniorityLevel !== 'N/A' && (
                <View className="bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                  <Text className="text-xs text-white opacity-80">Level</Text>
                  <Text className="text-lg font-bold text-white">{seniorityLevel}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Contact Information Card */}
      {(email || phone || location) && (
        <View className="bg-white p-6 mb-2 mx-4 -mt-4 rounded-lg shadow-md border border-gray-100">
          <View className="gap-3">
            {email && (
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center">
                  <Mail size={18} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Email</Text>
                  <Text className="text-sm font-semibold text-gray-900">{email}</Text>
                </View>
              </View>
            )}
            {phone && (
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                  <Phone size={18} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Phone</Text>
                  <Text className="text-sm font-semibold text-gray-900">{phone}</Text>
                </View>
              </View>
            )}
            {location && (
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center">
                  <MapPin size={18} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Location</Text>
                  <Text className="text-sm font-semibold text-gray-900">{location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Work Experience Section */}
      {experience.length > 0 && (
        <View className="bg-white p-6 mb-4 mt-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-orange-200">
            <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center">
              <Briefcase size={20} color="#F97316" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Experience</Text>
            <View className="flex-1" />
            <View className="bg-orange-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-orange-700">{experience.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {experience.map((exp: any, index: number) => (
              <View key={index} className={`${index !== experience.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                <View className="flex-row items-start gap-3">
                  <View className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">{exp.jobTitle}</Text>
                    <Text className="text-sm font-semibold text-orange-600 mt-1">{exp.company}</Text>
                    {(exp.startDate || exp.endDate) && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : '(Current)'}
                      </Text>
                    )}
                    {exp.location && (
                      <View className="flex-row items-center gap-1 mt-1">
                        <MapPin size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-600">{exp.location}</Text>
                      </View>
                    )}
                    {exp.responsibilities && Array.isArray(exp.responsibilities) && (
                      <View className="mt-2 gap-1">
                        {exp.responsibilities.slice(0, 3).map((resp: string, i: number) => (
                          <Text key={i} className="text-sm text-gray-600">• {resp}</Text>
                        ))}
                        {exp.responsibilities.length > 3 && (
                          <Text className="text-xs text-gray-500 mt-1">+{exp.responsibilities.length - 3} more</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-blue-200">
            <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
              <GraduationCap size={20} color="#3B82F6" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Education</Text>
            <View className="flex-1" />
            <View className="bg-blue-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-blue-700">{education.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {education.map((edu: any, index: number) => (
              <View key={index} className={`${index !== education.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                <View className="flex-row items-start gap-3">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">{edu.degree}</Text>
                    <Text className="text-sm font-semibold text-blue-600 mt-1">{edu.institution}</Text>
                    {edu.fieldOfStudy && (
                      <Text className="text-xs text-gray-600 mt-1">{edu.fieldOfStudy}</Text>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : '(Current)'}
                      </Text>
                    )}
                    {edu.description && (
                      <Text className="text-sm text-gray-600 mt-2">{edu.description}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-purple-200">
            <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
              <Code size={20} color="#A855F7" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Skills</Text>
            <View className="flex-1" />
            <View className="bg-purple-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-purple-700">{skills.length}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
              <View key={index} className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-full flex-row items-center gap-1.5">
                <Zap size={12} color="#A855F7" />
                <Text className="text-sm font-semibold text-purple-700">{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Languages Section */}
      {languages.length > 0 && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-green-200">
            <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center">
              <Globe size={20} color="#22C55E" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Languages</Text>
            <View className="flex-1" />
            <View className="bg-green-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-green-700">{languages.length}</Text>
            </View>
          </View>

          <View className="gap-3">
            {languages.map((lang: any, index: number) => (
              <View key={index} className={`flex-row items-center justify-between ${index !== languages.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{typeof lang === 'string' ? lang : lang.language || lang.name}</Text>
                  {typeof lang === 'object' && (lang.proficiency || lang.level) && (
                    <Text className="text-xs text-gray-600 mt-1">{lang.proficiency || lang.level}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-yellow-200">
            <View className="w-10 h-10 bg-yellow-100 rounded-lg items-center justify-center">
              <Trophy size={20} color="#EAB308" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Certifications</Text>
            <View className="flex-1" />
            <View className="bg-yellow-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-yellow-700">{certifications.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {certifications.map((cert: any, index: number) => (
              <View key={index} className={`${index !== certifications.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                <View className="flex-row items-start gap-3">
                  <CheckCircle size={18} color="#EAB308" className="mt-1" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">{cert.name}</Text>
                    {cert.issuer && (
                      <Text className="text-sm text-yellow-600 font-semibold mt-1">{cert.issuer}</Text>
                    )}
                    {(cert.date || cert.expiryDate) && (
                      <Text className="text-xs text-gray-600 mt-1">
                        {cert.date} {cert.expiryDate ? `(Expires: ${cert.expiryDate})` : ''}
                      </Text>
                    )}
                    {cert.credentialId && (
                      <Text className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Internships Section */}
      {internships.length > 0 && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-indigo-200">
            <View className="w-10 h-10 bg-indigo-100 rounded-lg items-center justify-center">
              <BookOpen size={20} color="#6366F1" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Internships</Text>
            <View className="flex-1" />
            <View className="bg-indigo-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-indigo-700">{internships.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {internships.map((intern: any, index: number) => (
              <View key={index} className={`${index !== internships.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                <View className="flex-row items-start gap-3">
                  <View className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">{intern.title}</Text>
                    <Text className="text-sm font-semibold text-indigo-600 mt-1">{intern.company}</Text>
                    {(intern.startDate || intern.endDate) && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {intern.startDate} {intern.endDate ? `— ${intern.endDate}` : '(Current)'}
                      </Text>
                    )}
                    {intern.description && (
                      <Text className="text-sm text-gray-600 mt-2">{intern.description}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Keywords/Industry Section */}
      {(industry || keywords.length > 0) && (
        <View className="bg-white p-6 mb-4">
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b-2 border-cyan-200">
            <View className="w-10 h-10 bg-cyan-100 rounded-lg items-center justify-center">
              <Lightbulb size={20} color="#06B6D4" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Profile Info</Text>
          </View>

          <View className="gap-3">
            {industry && (
              <View>
                <Text className="text-xs text-gray-500 mb-1">Industry</Text>
                <Text className="text-base font-semibold text-gray-900">{industry}</Text>
              </View>
            )}
            {keywords.length > 0 && (
              <View>
                <Text className="text-xs text-gray-500 mb-2">Keywords</Text>
                <View className="flex-row flex-wrap gap-2">
                  {keywords.map((keyword: string, i: number) => (
                    <View key={i} className="bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                      <Text className="text-xs font-semibold text-cyan-700">{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer spacing */}
      <View className="h-6" />
    </ScrollView>
  );
}
