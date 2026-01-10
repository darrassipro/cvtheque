/**
 * Screen Onboarding (explore.tsx)
 * Principe SOLID: SRP - Affichage onboarding uniquement
 * Utilise les hooks et composants modulaires
 * UI/UX Premium avec animations fluides
 */

import { View, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useRef, useEffect } from 'react';
import {
  OnboardingSlide,
  OnboardingDots,
  OnboardingButton
} from '@/components/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { onboardingSlides } from '@/constants/onboardingData';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

/**
 * Écran d'onboarding premium
 * Design moderne avec animations fluides
 */
export default function OnboardingScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Hook personnalisé pour la logique
  const onboarding = useOnboarding({
    slides: onboardingSlides,
    onComplete: () => {
      router.replace('/(tabs)');
    }
  });

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Synchroniser le scroll avec le slide actuel
  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    if (slideIndex !== onboarding.currentSlide) {
      onboarding.goToSlide(slideIndex);
    }
  };

  // Scroll au slide suivant
  const handleNext = () => {
    if (onboarding.canGoNext) {
      scrollViewRef.current?.scrollTo({
        x: width * (onboarding.currentSlide + 1),
        animated: true
      });
      onboarding.next();
    } else {
      onboarding.complete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Background Overlay */}
      <View style={styles.gradientOverlay} />

      {/* Bouton Skip élégant */}
      <Animated.View 
        style={[
          styles.skipContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onboarding.skip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <Animated.View style={[styles.slidesContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          decelerationRate="fast"
        >
          {onboardingSlides.map((slide, index) => (
            <View key={slide.id} style={{ width }}>
              <OnboardingSlide
                slide={slide}
                isActive={index === onboarding.currentSlide}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Bottom Section avec Dots et Bouton */}
      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, -1) }]
          }
        ]}
      >
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          <OnboardingDots
            total={onboarding.totalSlides}
            current={onboarding.currentSlide}
            activeColor="#AB8BFF"
            inactiveColor="rgba(255, 255, 255, 0.3)"
          />
        </View>

        {/* Bouton Next/Commencer Premium */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {onboarding.currentSlide === onboarding.totalSlides - 1
                ? '🚀 Commencer'
                : 'Suivant →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {onboarding.currentSlide + 1} / {onboarding.totalSlides}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030014',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  slidesContainer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 50,
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#AB8BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#AB8BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});