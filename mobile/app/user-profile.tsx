/**
 * User Profile Screen
 * Allows users to view and update their profile and CV information
 */

import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, User as UserIcon, Mail, Phone, Save, Camera, MapPin, Briefcase, GraduationCap, Trash2, Plus, AlertCircle } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { updateUser, User } from '@/lib/slices/authSlice';
import { useUpdateProfileMutation, useGetProfileCVQuery, useUpdateProfileCVMutation, useListUserCVsQuery, useSetDefaultCVMutation, useDeleteCVMutation } from '@/lib/services/userApi';
import { useToast } from '@/lib/context/ToastContext';

interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  country: string;
  age?: string;
  gender?: string;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  experience: Array<{
    jobTitle: string;
    company: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
    achievements?: string[];
    location?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  languages: Array<{
    language: string;
    proficiency?: string;
    spoken?: string;
    written?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  internships: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
}

export default function UserProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const [updateProfileApi, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: cvData, isLoading: isCVLoading } = useGetProfileCVQuery(undefined);
  const [updateCVApi, { isLoading: isCVUpdating }] = useUpdateProfileCVMutation();
  const { data: allCVsData, isLoading: isLoadingCVs } = useListUserCVsQuery(undefined);
  const [setDefaultCVApi, { isLoading: isSettingDefault }] = useSetDefaultCVMutation();
  const [deleteCVApi, { isLoading: isDeleting }] = useDeleteCVMutation();

  const [activeTab, setActiveTab] = useState<'personal' | 'cv'>('personal');
  const [expandedArchive, setExpandedArchive] = useState(false);
  
  // Check if account is active
  const isAccountActive = user?.status === 'ACTIVE';
  const isPendingApproval = user?.status === 'PENDING';

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [cvFormData, setCvFormData] = useState<CVFormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    country: '',
    age: '',
    gender: '',
    education: [],
    experience: [],
    skills: { technical: [], soft: [], tools: [] },
    languages: [],
    certifications: [],
    internships: [],
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (cvData?.data) {
      setCvFormData({
        fullName: cvData.data.fullName || '',
        email: cvData.data.email || '',
        phone: cvData.data.phone || '',
        location: cvData.data.location || '',
        city: cvData.data.city || '',
        country: cvData.data.country || '',
        age: cvData.data.age?.toString() || '',
        gender: cvData.data.gender || '',
        education: cvData.data.education || [],
        experience: cvData.data.experience || [],
        skills: cvData.data.skills || { technical: [], soft: [], tools: [] },
        languages: cvData.data.languages || [],
        certifications: cvData.data.certifications || [],
        internships: cvData.data.internships || [],
      });
    }
  }, [cvData]);

  const handleSave = async () => {
    if (!user) return;

    // Check if account is active
    if (!isAccountActive) {
      showToast('Your account is not active. Please contact an administrator.', 'warning', 5000);
      return;
    }

    try {
      if (activeTab === 'personal') {
        await updateProfileApi(formData).unwrap();
        dispatch(updateUser(formData));
        showToast('Profile updated successfully!', 'success');
      } else {
        await updateCVApi(cvFormData).unwrap();
        showToast('CV information updated successfully!', 'success');
      }
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update:', error);
      showToast('Failed to update. Please try again.', 'error');
    }
  };

  const hasChanges = () => {
    if (activeTab === 'personal') {
      return (
        formData.firstName !== user?.firstName ||
        formData.lastName !== user?.lastName ||
        formData.email !== user?.email ||
        formData.phone !== user?.phone
      );
    } else {
      // Deep comparison for CV data
      return JSON.stringify(cvFormData) !== JSON.stringify(cvData?.data || {});
    }
  };

  const getInitials = () => {
    const firstInitial = formData.firstName?.charAt(0) || '';
    const lastInitial = formData.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  // Helper functions for managing CV arrays
  const addEducation = () => {
    setCvFormData({
      ...cvFormData,
      education: [...cvFormData.education, { degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const education = [...cvFormData.education];
    const updated = { ...education[index], [field]: value };
    education[index] = updated;
    setCvFormData({ ...cvFormData, education });
  };

  const removeEducation = (index: number) => {
    setCvFormData({
      ...cvFormData,
      education: cvFormData.education.filter((_, i) => i !== index),
    });
  };

  const addExperience = () => {
    setCvFormData({
      ...cvFormData,
      experience: [...cvFormData.experience, { jobTitle: '', company: '', startDate: '', endDate: '', location: '', responsibilities: [], achievements: [] }],
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const experience = [...cvFormData.experience];
    const updated = { ...experience[index], [field]: value };
    experience[index] = updated;
    setCvFormData({ ...cvFormData, experience });
  };

  const removeExperience = (index: number) => {
    setCvFormData({
      ...cvFormData,
      experience: cvFormData.experience.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    setCvFormData({
      ...cvFormData,
      languages: [...cvFormData.languages, { language: '', proficiency: '', spoken: '', written: '' }],
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const languages = [...cvFormData.languages];
    const updated = { ...languages[index], [field]: value };
    languages[index] = updated;
    setCvFormData({ ...cvFormData, languages });
  };

  const removeLanguage = (index: number) => {
    setCvFormData({
      ...cvFormData,
      languages: cvFormData.languages.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    setCvFormData({
      ...cvFormData,
      certifications: [...cvFormData.certifications, { name: '', issuer: '', date: '', expiryDate: '', credentialId: '' }],
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const certifications = [...cvFormData.certifications];
    const updated = { ...certifications[index], [field]: value };
    certifications[index] = updated;
    setCvFormData({ ...cvFormData, certifications });
  };

  const removeCertification = (index: number) => {
    setCvFormData({
      ...cvFormData,
      certifications: cvFormData.certifications.filter((_, i) => i !== index),
    });
  };

  const addInternship = () => {
    setCvFormData({
      ...cvFormData,
      internships: [...cvFormData.internships, { title: '', company: '', startDate: '', endDate: '', description: '' }],
    });
  };

  const updateInternship = (index: number, field: string, value: string) => {
    const internships = [...cvFormData.internships];
    const updated = { ...internships[index], [field]: value };
    internships[index] = updated;
    setCvFormData({ ...cvFormData, internships });
  };

  const removeInternship = (index: number) => {
    setCvFormData({
      ...cvFormData,
      internships: cvFormData.internships.filter((_, i) => i !== index),
    });
  };

  // Skills management
  const addSkill = (category: 'technical' | 'soft' | 'tools', skill: string) => {
    if (skill.trim()) {
      setCvFormData({
        ...cvFormData,
        skills: {
          ...cvFormData.skills,
          [category]: [...cvFormData.skills[category], skill.trim()],
        },
      });
    }
  };

  const removeSkill = (category: 'technical' | 'soft' | 'tools', index: number) => {
    setCvFormData({
      ...cvFormData,
      skills: {
        ...cvFormData.skills,
        [category]: cvFormData.skills[category].filter((_, i) => i !== index),
      },
    });
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between p-4 pt-12">
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#F97316" />
            <Text className="text-orange-600 font-semibold">Back</Text>
          </TouchableOpacity>
          
          {hasChanges() && (
            <TouchableOpacity
              className={`px-4 py-2 rounded-lg ${isUpdating || isCVUpdating || !isAccountActive ? 'bg-gray-400' : 'bg-orange-600'}`}
              onPress={handleSave}
              disabled={isUpdating || isCVUpdating || !isAccountActive}
            >
              {isUpdating || isCVUpdating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Save size={16} color="#FFF" />
                  <Text className="text-white font-semibold">Save</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Header */}
      <View className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 py-8">
        <View className="items-center">
          {/* Avatar */}
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-4 border-white shadow-lg">
              <Text className="text-5xl font-bold text-orange-500">
                {getInitials()}
              </Text>
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border-2 border-orange-500 items-center justify-center shadow-md"
              activeOpacity={0.7}
            >
              <Camera size={18} color="#F97316" />
            </TouchableOpacity>
          </View>

          {/* Role Badge */}
          <View className="bg-white bg-opacity-20 px-4 py-2 rounded-full mt-4">
            <Text className="text-sm font-semibold text-white">
              {user.role}
            </Text>
          </View>
        </View>
      </View>

      {/* Pending Approval Banner */}
      {isPendingApproval && (
        <View className="bg-yellow-50 border border-yellow-200 mx-4 mt-4 p-4 rounded-lg flex-row items-start gap-3">
          <AlertCircle size={20} color="#F59E0B" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-yellow-900 font-semibold">Account Pending Approval</Text>
            <Text className="text-yellow-800 text-sm mt-1">
              Your account is awaiting admin approval. You can view content but cannot make changes until approved.
            </Text>
          </View>
        </View>
      )}

      {/* Success Message */}
      {isSaved && (
        <View className="bg-green-50 border border-green-200 mx-4 mt-4 p-4 rounded-lg">
          <Text className="text-green-700 font-medium text-center">
            ✓ {activeTab === 'personal' ? 'Profile' : 'CV information'} updated successfully
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-lg p-1 shadow-sm">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${activeTab === 'personal' ? 'bg-orange-500' : 'bg-transparent'}`}
          onPress={() => setActiveTab('personal')}
        >
          <Text className={`text-center font-semibold ${activeTab === 'personal' ? 'text-white' : 'text-gray-600'}`}>
            Personal Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${activeTab === 'cv' ? 'bg-orange-500' : 'bg-transparent'}`}
          onPress={() => setActiveTab('cv')}
        >
          <Text className={`text-center font-semibold ${activeTab === 'cv' ? 'text-white' : 'text-gray-600'}`}>
            CV Information
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information Form */}
      {activeTab === 'personal' && (
        <View className="bg-white p-6 m-4 rounded-lg shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-6">Personal Information</Text>

          {/* First Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">First Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <UserIcon size={20} color="#64748B" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Last Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <UserIcon size={20} color="#64748B" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
          <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <Mail size={20} color="#64748B" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
          <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <Phone size={20} color="#64748B" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Account Info */}
        <View className="mt-6 pt-6 border-t border-gray-200">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Account Information</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-gray-600">Status</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-green-700">{user.status}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-gray-600">Member Since</Text>
            <Text className="text-sm font-medium text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">User ID</Text>
            <Text className="text-xs font-mono text-gray-500">
              {user.id.substring(0, 8)}...
            </Text>
          </View>
        </View>
      </View>
      )}

      {/* CV Information Form */}
      {activeTab === 'cv' && (
        <ScrollView className="bg-white p-6 m-4 rounded-lg shadow-sm">
          {isCVLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#F97316" />
              <Text className="text-gray-500 mt-4">Loading CV information...</Text>
            </View>
          ) : !cvData?.data ? (
            <View className="py-8 items-center">
              <Briefcase size={48} color="#D1D5DB" />
              <Text className="text-gray-600 mt-4 text-center">
                No CV uploaded yet.{'\n'}Upload a CV to see your information here.
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-xl font-bold text-gray-900 mb-6">CV Information</Text>

              {/* Personal Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800 mb-4">Personal Information</Text>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <UserIcon size={20} color="#64748B" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      value={cvFormData.fullName}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, fullName: text })}
                      placeholder="Full name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <Mail size={20} color="#64748B" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      value={cvFormData.email}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, email: text })}
                      placeholder="Email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <Phone size={20} color="#64748B" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      value={cvFormData.phone}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, phone: text })}
                      placeholder="Phone"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Location</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <MapPin size={20} color="#64748B" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      value={cvFormData.location}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, location: text })}
                      placeholder="Location"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">City</Text>
                    <TextInput
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-gray-900"
                      value={cvFormData.city}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, city: text })}
                      placeholder="City"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Country</Text>
                    <TextInput
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-gray-900"
                      value={cvFormData.country}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, country: text })}
                      placeholder="Country"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4 mt-4">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Age</Text>
                    <TextInput
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-gray-900"
                      value={cvFormData.age}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, age: text })}
                      placeholder="Age"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Gender</Text>
                    <TextInput
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-gray-900"
                      value={cvFormData.gender}
                      onChangeText={(text) => setCvFormData({ ...cvFormData, gender: text })}
                      placeholder="Gender"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              {/* Skills Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800 mb-4">Skills</Text>

                {/* Technical Skills */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Technical Skills</Text>
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {cvFormData.skills.technical.map((skill, index) => (
                      <View key={index} className="bg-blue-100 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                        <Text className="text-blue-700 text-sm">{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill('technical', index)}>
                          <Text className="text-blue-700 font-bold ml-1">×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                      placeholder="Add technical skill"
                      placeholderTextColor="#9CA3AF"
                      onSubmitEditing={(e) => {
                        addSkill('technical', e.nativeEvent.text);
                        e.currentTarget.clear();
                      }}
                    />
                  </View>
                </View>

                {/* Soft Skills */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Soft Skills</Text>
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {cvFormData.skills.soft.map((skill, index) => (
                      <View key={index} className="bg-green-100 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                        <Text className="text-green-700 text-sm">{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill('soft', index)}>
                          <Text className="text-green-700 font-bold ml-1">×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                      placeholder="Add soft skill"
                      placeholderTextColor="#9CA3AF"
                      onSubmitEditing={(e) => {
                        addSkill('soft', e.nativeEvent.text);
                        e.currentTarget.clear();
                      }}
                    />
                  </View>
                </View>

                {/* Tools */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Tools & Technologies</Text>
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {cvFormData.skills.tools.map((skill, index) => (
                      <View key={index} className="bg-purple-100 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                        <Text className="text-purple-700 text-sm">{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill('tools', index)}>
                          <Text className="text-purple-700 font-bold ml-1">×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                      placeholder="Add tool or technology"
                      placeholderTextColor="#9CA3AF"
                      onSubmitEditing={(e) => {
                        addSkill('tools', e.nativeEvent.text);
                        e.currentTarget.clear();
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Experience Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Experience</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg"
                    onPress={addExperience}
                  >
                    <Plus size={16} color="#F97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Add</Text>
                  </TouchableOpacity>
                </View>

                {cvFormData.experience.map((exp, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-semibold text-gray-700">Experience {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeExperience(index)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Job Title"
                      value={exp.jobTitle}
                      onChangeText={(text) => updateExperience(index, 'jobTitle', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Company"
                      value={exp.company}
                      onChangeText={(text) => updateExperience(index, 'company', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Location"
                      value={exp.location || ''}
                      onChangeText={(text) => updateExperience(index, 'location', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="Start Date"
                        value={exp.startDate || ''}
                        onChangeText={(text) => updateExperience(index, 'startDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="End Date"
                        value={exp.endDate || ''}
                        onChangeText={(text) => updateExperience(index, 'endDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Education Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Education</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg"
                    onPress={addEducation}
                  >
                    <Plus size={16} color="#F97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Add</Text>
                  </TouchableOpacity>
                </View>

                {cvFormData.education.map((edu, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-semibold text-gray-700">Education {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeEducation(index)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Degree"
                      value={edu.degree}
                      onChangeText={(text) => updateEducation(index, 'degree', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Institution"
                      value={edu.institution}
                      onChangeText={(text) => updateEducation(index, 'institution', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Field of Study"
                      value={edu.fieldOfStudy || ''}
                      onChangeText={(text) => updateEducation(index, 'fieldOfStudy', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="Start Date"
                        value={edu.startDate || ''}
                        onChangeText={(text) => updateEducation(index, 'startDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="End Date"
                        value={edu.endDate || ''}
                        onChangeText={(text) => updateEducation(index, 'endDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Languages Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Languages</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg"
                    onPress={addLanguage}
                  >
                    <Plus size={16} color="#F97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Add</Text>
                  </TouchableOpacity>
                </View>

                {cvFormData.languages.map((lang, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-semibold text-gray-700">Language {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeLanguage(index)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Language"
                      value={lang.language}
                      onChangeText={(text) => updateLanguage(index, 'language', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                      placeholder="Proficiency (e.g., Fluent, Intermediate)"
                      value={lang.proficiency || ''}
                      onChangeText={(text) => updateLanguage(index, 'proficiency', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ))}
              </View>

              {/* Certifications Section */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Certifications</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg"
                    onPress={addCertification}
                  >
                    <Plus size={16} color="#F97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Add</Text>
                  </TouchableOpacity>
                </View>

                {cvFormData.certifications.map((cert, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-semibold text-gray-700">Certification {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeCertification(index)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Certification Name"
                      value={cert.name}
                      onChangeText={(text) => updateCertification(index, 'name', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Issuer"
                      value={cert.issuer || ''}
                      onChangeText={(text) => updateCertification(index, 'issuer', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="Date"
                        value={cert.date || ''}
                        onChangeText={(text) => updateCertification(index, 'date', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="Expiry Date"
                        value={cert.expiryDate || ''}
                        onChangeText={(text) => updateCertification(index, 'expiryDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Internships Section */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Internships</Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg"
                    onPress={addInternship}
                  >
                    <Plus size={16} color="#F97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Add</Text>
                  </TouchableOpacity>
                </View>

                {cvFormData.internships.map((intern, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-semibold text-gray-700">Internship {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeInternship(index)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Title"
                      value={intern.title}
                      onChangeText={(text) => updateInternship(index, 'title', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900 mb-2"
                      placeholder="Company"
                      value={intern.company}
                      onChangeText={(text) => updateInternship(index, 'company', text)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View className="flex-row gap-2 mb-2">
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="Start Date"
                        value={intern.startDate || ''}
                        onChangeText={(text) => updateInternship(index, 'startDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                        placeholder="End Date"
                        value={intern.endDate || ''}
                        onChangeText={(text) => updateInternship(index, 'endDate', text)}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-900"
                      placeholder="Description"
                      value={intern.description || ''}
                      onChangeText={(text) => updateInternship(index, 'description', text)}
                      placeholderTextColor="#9CA3AF"
                      multiline
                    />
                  </View>
                ))}
              </View>

              {/* CV Stats */}
              {cvData.data.totalExperienceYears !== undefined && (
                <View className="mt-6 pt-6 border-t border-gray-200">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">CV Statistics</Text>
                  
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm text-gray-600">Experience</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {cvData.data.totalExperienceYears} years
                    </Text>
                  </View>

                  {cvData.data.seniorityLevel && (
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-sm text-gray-600">Seniority Level</Text>
                      <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-orange-700">
                          {cvData.data.seniorityLevel}
                        </Text>
                      </View>
                    </View>
                  )}

                  {cvData.data.industry && (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Industry</Text>
                      <Text className="text-sm font-medium text-gray-900">{cvData.data.industry}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* CV Archive Section */}
              {allCVsData?.data && allCVsData.data.length > 1 && (
                <View className="mt-8 pt-6 border-t border-gray-200">
                  <TouchableOpacity
                    className="flex-row justify-between items-center mb-4"
                    onPress={() => setExpandedArchive(!expandedArchive)}
                  >
                    <Text className="text-lg font-bold text-gray-800">CV Archive</Text>
                    <Text className="text-sm text-gray-500">{allCVsData.data.length - 1} archived</Text>
                  </TouchableOpacity>

                  {expandedArchive && (
                    <View className="space-y-3">
                      {allCVsData.data.map((cv, index) => (
                        !cv.isDefault && (
                          <View key={cv.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <View className="flex-row justify-between items-start mb-2">
                              <View className="flex-1">
                                <Text className="font-semibold text-gray-900 text-sm">
                                  {cv.extractedData?.fullName || cv.originalFileName}
                                </Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                  Uploaded: {new Date(cv.createdAt).toLocaleDateString()}
                                </Text>
                                {cv.status === 'ARCHIVED' && (
                                  <View className="bg-yellow-100 px-2 py-1 rounded mt-2 self-start">
                                    <Text className="text-xs font-medium text-yellow-700">Archived</Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {cv.extractedData && (
                              <View className="mb-3 pb-3 border-b border-gray-200">
                                <Text className="text-xs text-gray-600">
                                  {cv.extractedData.email && `📧 ${cv.extractedData.email}`}
                                  {cv.extractedData.phone && ` | 📱 ${cv.extractedData.phone}`}
                                </Text>
                              </View>
                            )}

                            <View className="flex-row gap-2">
                              <TouchableOpacity
                                className="flex-1 bg-orange-600 px-3 py-2 rounded-lg"
                                onPress={() => setDefaultCVApi(cv.id)}
                                disabled={isSettingDefault}
                              >
                                <Text className="text-white text-xs font-semibold text-center">
                                  {isSettingDefault ? '...' : 'Set as Default'}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                className="flex-1 bg-red-100 px-3 py-2 rounded-lg"
                                onPress={() => {
                                  if (confirm('Are you sure you want to delete this CV?')) {
                                    deleteCVApi(cv.id);
                                  }
                                }}
                                disabled={isDeleting}
                              >
                                <Text className="text-red-600 text-xs font-semibold text-center">
                                  {isDeleting ? '...' : 'Delete'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
