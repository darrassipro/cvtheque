/**
 * Onboarding Screen
 * Shown to new users before authentication
 * Displays welcome slides and transitions to auth modal
 */

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '@/hooks/useOnboarding';
import { onboardingSlides } from '@/constants/onboardingData';
import { OnboardingSlide, OnboardingDots, OnboardingButton } from '@/components/onboarding';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const {
    currentSlide,
    isCompleted,
    canGoNext,
    totalSlides,
    next,
    skip,
  } = useOnboarding({
    slides: onboardingSlides,
    onComplete: async () => {
      // Mark onboarding as seen
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      // Navigate to home page (tabs) and show auth modal
      router.replace('/(tabs)');
      setTimeout(() => {
        router.push('/auth-modal');
      }, 300);
    },
  });

  const slideAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentSlide,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentSlide]);

  const slide = onboardingSlides[currentSlide];
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <View className="flex-1 bg-white overflow-hidden">
      {/* Slide Content */}
      <Animated.View
        style={{
          width,
          height,
          opacity: slideAnim.interpolate({
            inputRange: [currentSlide - 1, currentSlide, currentSlide + 1],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          }),
        }}
      >
        <OnboardingSlide slide={slide} />
      </Animated.View>

      {/* Controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-6">
        {/* Dots */}
        <OnboardingDots
          currentSlide={currentSlide}
          totalSlides={totalSlides}
          onDotPress={(index) => {
            // Allow navigation by tapping dots
          }}
        />

        {/* Buttons */}
        <View className="flex-row items-center justify-between mt-8 gap-4">
          {/* Skip Button */}
          <TouchableOpacity
            onPress={skip}
            className="flex-1"
            activeOpacity={0.7}
          >
            <Text className="text-center text-cyan-600 font-semibold text-base">
              {isLastSlide ? 'Start' : 'Skip'}
            </Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={next}
            className="flex-1 bg-cyan-500 rounded-lg py-4 flex-row items-center justify-center gap-2 active:bg-cyan-600"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
