/**
 * API Configuration
 * Automatically detects local IP for development
 * Can be overridden via environment variables
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Fixed production API URL used as last-resort fallback
const PRODUCTION_FALLBACK = 'https://cvtheque.osc-fr1.scalingo.io';

// Configuration du port du serveur
const SERVER_PORT = process.env.EXPO_PUBLIC_SERVER_PORT || '12000';

/**
 * Extract local IP automatically from Expo constants
 * Priority order:
 * 1. Manual override via EXPO_PUBLIC_LOCAL_IP env var
 * 2. Auto-detect from Expo hostUri
 * 3. Fallback based on platform
 */
const getLocalIP = (): string | null => {
  // 1) Manual override via environment variable (highest priority)
  if (process.env.EXPO_PUBLIC_LOCAL_IP) {
    console.log('✅ Using manual IP from EXPO_PUBLIC_LOCAL_IP:', process.env.EXPO_PUBLIC_LOCAL_IP);
    return process.env.EXPO_PUBLIC_LOCAL_IP;
  }

  // 2) Auto-detect from Expo hostUri (development mode)
  const hostUri = Constants.expoConfig?.hostUri || (Constants.manifest as any)?.debuggerHost || null;
  
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    
    // Validate it's a real IP (not localhost or 127.0.0.1)
    const isValidIP = /^\d+\.\d+\.\d+\.\d+$/.test(host);
    
    if (host && host !== 'localhost' && host !== '127.0.0.1' && isValidIP) {
      console.log('✅ Local IP auto-detected from Expo hostUri:', host);
      return host;
    }
  }

  // 3) No IP detected
  console.warn('⚠️ Could not auto-detect local IP from Expo');
  return null;
};

/**
 * Get the API base URL
 * Supports multiple configuration methods with fallbacks
 */
const getApiBaseUrl = (): string => {
  // 1) Explicit API URL override (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    const url = process.env.EXPO_PUBLIC_API_URL;
    console.log('✅ Using explicit API URL from EXPO_PUBLIC_API_URL:', url);
    return url;
  }

  // 2) In release builds, force production backend (Expo dev host not available)
  if (!__DEV__) {
    console.log('✅ Using production fallback in release build:', PRODUCTION_FALLBACK);
    return PRODUCTION_FALLBACK;
  }

  // 3) Auto-detect local IP from Expo (dev only)
  const localIP = getLocalIP();

  if (localIP) {
    const url = `http://${localIP}:${SERVER_PORT}`;
    console.log('✅ Using auto-detected local IP:', url);
    return url;
  }

  // 4) Android Emulator fallback
  // 10.0.2.2 is the special IP for accessing the host machine in Android emulator
  if (Platform.OS === 'android') {
    const emulatorUrl = `http://10.0.2.2:${SERVER_PORT}`;
    console.log('⚠️ Using Android emulator fallback:', emulatorUrl);
    console.log('   For physical device, ensure EXPO_PUBLIC_LOCAL_IP is set or Expo auto-detects');
    return emulatorUrl;
  }

  // 5) iOS Simulator fallback
  // localhost works on iOS simulator
  if (Platform.OS === 'ios') {
    const iosUrl = `http://localhost:${SERVER_PORT}`;
    console.log('⚠️ Using iOS simulator fallback:', iosUrl);
    console.log('   For physical device, ensure EXPO_PUBLIC_LOCAL_IP is set or Expo auto-detects');
    return iosUrl;
  }

  // 6) Web fallback
  if (Platform.OS === 'web') {
    const webUrl = `http://localhost:${SERVER_PORT}`;
    console.log('⚠️ Using web fallback:', webUrl);
    return webUrl;
  }

  // 7) Production fallback (should rarely hit in dev)
  console.warn('⚠️ No auto-detection available, using production fallback:', PRODUCTION_FALLBACK);
  return PRODUCTION_FALLBACK;
};

// Export the API configuration
export const API_BASE_URL = getApiBaseUrl();
export const API_SERVER_PORT = SERVER_PORT;

console.log('📡 API Configuration Loaded');
console.log('   Base URL:', API_BASE_URL);
console.log('   Server Port:', API_SERVER_PORT);
