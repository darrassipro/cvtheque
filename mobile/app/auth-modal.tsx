/**
 * Auth Modal Screen
 * Displays login and register forms as dismissible modal overlay
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useRegisterMutation } from '@/lib/services/authApi';
import { setCredentials } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';
import { router } from 'expo-router';
import { 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';

type AuthMode = 'login' | 'register';

export default function AuthModalScreen() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
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

  // Animation values - minimalist security-themed
  const shieldPulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If user is already authenticated, redirect them away from auth modal
    if (isAuthenticated) {
      console.log('[Auth Modal] User already authenticated - redirecting to home');
      router.replace('/(tabs)');
      return;
    }

    // Subtle shield pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldPulse, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shieldPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated]);

  // Handle close/dismiss
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
    <View className="flex-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Overlay - Tap to dismiss */}
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1}
          onPress={handleDismiss}
        />

        {/* Modal Content - Bottom Sheet Style with Orange Top Border */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SafeAreaView
            className="bg-white rounded-t-3xl overflow-hidden border-t-4 border-orange-500"
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
                    className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2 active:bg-gray-200"
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={20} color="#1F2937" strokeWidth={2.5} />
                    <Text className="text-gray-900 font-bold text-sm">Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  onPress={handleDismiss}
                  className="bg-gray-100 rounded-full p-2.5 active:bg-gray-200"
                  activeOpacity={0.7}
                >
                  <X size={20} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Header - Minimalist Security Theme */}
              <View className="px-6 pb-6">
                <View className="flex-row items-center mb-2">
                  <Animated.View style={{ transform: [{ scale: shieldPulse }] }}>
                    <Shield size={32} color="#F97316" strokeWidth={2} />
                  </Animated.View>
                  <Text className="text-3xl font-bold text-gray-900 ml-3">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </Text>
                </View>
                <Text className="text-gray-600">
                  {mode === 'login'
                    ? 'Sign in to access your CVs securely'
                    : 'Get started with secure CV analysis'}
                </Text>
              </View>

              {/* Form Content */}
              <View className="px-6 pb-8">
                {/* Error Message */}
                {error && (
                  <View className="mb-4 p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                    <View className="flex-row items-center">
                      <AlertCircle size={18} color="#DC2626" />
                      <Text className="text-red-700 font-semibold text-sm ml-2">{error}</Text>
                    </View>
                  </View>
                )}

                {mode === 'login' ? (
                  // LOGIN FORM
                  <View className="space-y-4">
                    {/* Email */}
                    <View>
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Email Address
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <Mail size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
                          placeholder="Enter your email"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isLoading}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View>
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Password
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <Lock size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
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
                          className="p-1"
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
                      className={`w-full py-4 px-6 rounded-xl mt-6 flex-row items-center justify-center ${
                        isLoading ? 'bg-orange-400' : 'bg-orange-600 active:bg-orange-700'
                      }`}
                      onPress={handleLogin}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator color="white" />
                          <Text className="text-white font-bold text-lg ml-3">
                            Signing In...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <LogIn size={22} color="white" strokeWidth={2.5} />
                          <Text className="text-white font-bold text-lg ml-3">
                            Sign In
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View className="flex-row justify-center items-center mt-6">
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
                        <Text className="text-orange-600 font-bold text-sm">Sign up</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // REGISTER FORM
                  <View className="space-y-4">
                    {/* Full Name */}
                    <View>
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Full Name
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <User size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChangeText={setFullName}
                          editable={!isLoading}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>

                    {/* Email */}
                    <View>
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Email Address
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <Mail size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
                          placeholder="Enter your email"
                          value={registerEmail}
                          onChangeText={setRegisterEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isLoading}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View>
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Password
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <Lock size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
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
                          className="p-1"
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
                      <Text className="text-sm font-bold text-gray-700 mb-2">
                        Confirm Password
                      </Text>
                      <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50 px-4">
                        <CheckCircle2 size={20} color="#F97316" strokeWidth={2.5} />
                        <TextInput
                          className="flex-1 py-3 text-gray-900 ml-3"
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
                          className="p-1"
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
                      className={`w-full py-4 px-6 rounded-xl mt-6 flex-row items-center justify-center ${
                        isLoading ? 'bg-orange-400' : 'bg-orange-600 active:bg-orange-700'
                      }`}
                      onPress={handleRegister}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator color="white" />
                          <Text className="text-white font-bold text-lg ml-3">
                            Creating Account...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <UserPlus size={22} color="white" strokeWidth={2.5} />
                          <Text className="text-white font-bold text-lg ml-3">
                            Create Account
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}