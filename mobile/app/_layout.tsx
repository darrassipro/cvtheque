import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import ReduxProvider from '@/lib/ReduxProvider';
import { ToastProvider } from '@/lib/context/ToastContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { restoreSession, setLoading } from '@/lib/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      try {
        // FOR TESTING: Uncomment the line below to reset onboarding
        // await AsyncStorage.removeItem('hasSeenOnboarding');
        
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('[Onboarding Check] hasSeenOnboarding value from storage:', seen);
        setHasSeenOnboarding(seen === 'false');
      } catch (error) {
        console.error('Failed to check onboarding:', error);
        setHasSeenOnboarding(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    // Restore session from AsyncStorage
    const restoreUserSession = async () => {
      try {
        const [userJson, accessToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('accessToken'),
        ]);

        if (userJson && accessToken) {
          const user = JSON.parse(userJson);
          dispatch(restoreSession(user));
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        dispatch(setLoading(false));
      }
    };

    restoreUserSession();
  }, [dispatch]);

  useEffect(() => {
    // Navigate based on app state
    if (isCheckingOnboarding || isLoading) {
      console.log('[Navigation] Waiting - isCheckingOnboarding:', isCheckingOnboarding, 'isLoading:', isLoading);
      return;
    }

    console.log('[Navigation] Checking state - hasSeenOnboarding:', hasSeenOnboarding, 'isAuthenticated:', isAuthenticated);

    // First launch - show onboarding by replacing the current route
    if (hasSeenOnboarding === false) {
      console.log('[Navigation] First launch detected - replacing with onboarding');
      router.replace('/onboarding');
      return;
    }

    // Onboarding has been seen - check authentication
    // If authenticated, stay on main tabs (don't navigate)
    // If not authenticated, show auth modal
    if (!isAuthenticated) {
      console.log('[Navigation] Not authenticated - showing auth modal');
      // Use setTimeout to ensure tabs are mounted first
      setTimeout(() => {
        console.log('[Navigation] Pushing auth-modal');
        router.push('/auth-modal');
      }, 100);
    } else {
      console.log('[Navigation] Authenticated - hiding auth modal and showing home');
      // If user somehow navigated to auth-modal while authenticated, go back to tabs
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [hasSeenOnboarding, isAuthenticated, isLoading, isCheckingOnboarding]);

  if (isCheckingOnboarding || isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Main App - MUST BE FIRST */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />

        {/* Onboarding Screen - First launch */}
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        
        {/* Auth Modal - appears over tabs when not authenticated */}
        <Stack.Screen
          name="auth-modal"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animationEnabled: true,
            cardStyle: { backgroundColor: 'transparent' },
          }}
        />
        
        {/* Upload Modal */}
        <Stack.Screen
          name="upload"
          options={{
            title: 'Upload CV',
            presentation: 'transparentModal',
            headerShown: false,
            animationEnabled: true,
            cardStyle: { backgroundColor: 'transparent' },
          }}
        />
        
        {/* CV Details Screen */}
        <Stack.Screen 
          name="cvs/[id]" 
          options={{ 
            title: 'CV Details',
            headerShown: false,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ReduxProvider>
  );
}
