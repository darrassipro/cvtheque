/**
 * Auth Modal Screen
 * Displays login and register forms as dismissible modal overlay
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useRegisterMutation } from '@/lib/services/authApi';
import { setCredentials } from '@/lib/slices/authSlice';
import { router } from 'expo-router';
import { Eye, EyeOff, ChevronLeft, X } from 'lucide-react-native';

type AuthMode = 'login' | 'register';

export default function AuthModalScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register fields
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();

  const isLoading = mode === 'login' ? loginLoading : registerLoading;

  // Handle close/dismiss - go back to home without modal
  const handleDismiss = () => {
    router.back();
  };

  // Handle login
  const handleLogin = async () => {
    try {
      setError('');
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result.data));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  // Handle register
  const handleRegister = async () => {
    try {
      setError('');
      if (!registerEmail || !registerPassword || !registerConfirmPassword || !fullName) {
        setError('Please fill in all fields');
        return;
      }
      if (registerPassword !== registerConfirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Split full name into firstName and lastName
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      const result = await register({
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
      }).unwrap();
      dispatch(setCredentials(result.data));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.data?.message || 'Registration failed');
    }
  };

  const screenHeight = Dimensions.get('window').height;

  return (
    <View className="flex-1 bg-black/30">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Overlay - visual only, not dismissible by tap */}
        <View className="flex-1" />

        {/* Modal Content - Bottom Sheet Style */}
        <SafeAreaView
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{
            maxHeight: screenHeight * 0.85,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Close Button */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
              {mode === 'register' ? (
                <TouchableOpacity
                  onPress={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="flex-row items-center gap-1"
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#1F2937" />
                  <Text className="text-gray-900 font-semibold">Back</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <TouchableOpacity
                onPress={handleDismiss}
                className="p-2"
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View className="px-6 pb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text className="text-gray-600">
                {mode === 'login'
                  ? 'Sign in to access your CVs'
                  : 'Get started with AI-powered CV analysis'}
              </Text>
            </View>

            {/* Form Content */}
            <View className="px-6 pb-8">
              {/* Error Message */}
              {error && (
                <View className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Text className="text-red-700 font-medium text-sm">{error}</Text>
                </View>
              )}

              {mode === 'login' ? (
                // LOGIN FORM
                <View className="space-y-4">
                  {/* Email */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </Text>
                    <TextInput
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4">
                      <TextInput
                        className="flex-1 py-3 text-gray-900"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sign In Button */}
                  <TouchableOpacity
                    className={`w-full py-4 rounded-lg mt-6 ${
                      isLoading ? 'bg-cyan-400' : 'bg-cyan-500 active:bg-cyan-600'
                    }`}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-bold text-lg">
                        Sign In
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Register Link */}
                  <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMode('register');
                        setError('');
                        setEmail('');
                        setPassword('');
                      }}
                      disabled={isLoading}
                    >
                      <Text className="text-cyan-600 font-bold text-sm">Sign up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // REGISTER FORM
                <View className="space-y-4">
                  {/* Full Name */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </Text>
                    <TextInput
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChangeText={setFullName}
                      editable={!isLoading}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Email */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </Text>
                    <TextInput
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChangeText={setRegisterEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4">
                      <TextInput
                        className="flex-1 py-3 text-gray-900"
                        placeholder="Create a password"
                        value={registerPassword}
                        onChangeText={setRegisterPassword}
                        secureTextEntry={!showRegisterPassword}
                        editable={!isLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                        disabled={isLoading}
                      >
                        {showRegisterPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4">
                      <TextInput
                        className="flex-1 py-3 text-gray-900"
                        placeholder="Confirm your password"
                        value={registerConfirmPassword}
                        onChangeText={setRegisterConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#6B7280" />
                        ) : (
                          <Eye size={20} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    className={`w-full py-4 rounded-lg mt-6 ${
                      isLoading ? 'bg-cyan-400' : 'bg-cyan-500 active:bg-cyan-600'
                    }`}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-bold text-lg">
                        Create Account
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
