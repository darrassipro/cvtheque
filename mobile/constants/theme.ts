/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Professional UI/UX Color Palette: Orange, Dark Blue, Yellow
 */

import { Platform } from 'react-native';

// Professional Color Palette - Orange, Dark Blue, Yellow
const tintColorLight = '#F97316'; // Orange-500
const tintColorDark = '#FB923C';  // Orange-400

export const Colors = {
  light: {
    // Text colors
    text: '#1E293B',          // Slate-800
    textSecondary: '#64748B', // Slate-500
    textMuted: '#94A3B8',     // Slate-400
    
    // Background colors
    background: '#F8FAFC',    // Slate-50
    surface: '#FFFFFF',       // White
    surfaceSecondary: '#F1F5F9', // Slate-100
    
    // Brand colors - Orange
    primary: '#F97316',       // Orange-500
    primaryLight: '#FB923C',  // Orange-400
    primaryDark: '#EA580C',   // Orange-600
    
    // Brand colors - Dark Blue
    secondary: '#1E3A8A',     // Blue-900
    secondaryLight: '#1E40AF', // Blue-800
    secondaryDark: '#1E293B',  // Slate-800
    
    // Brand colors - Yellow/Amber
    accent: '#F59E0B',        // Amber-500
    accentLight: '#FBBF24',   // Amber-400
    accentDark: '#D97706',    // Amber-600
    
    // UI colors
    border: '#E2E8F0',        // Slate-200
    borderLight: '#F1F5F9',   // Slate-100
    shadow: '#94A3B8',        // Slate-400
    
    // Status colors
    success: '#10B981',       // Green-500
    error: '#EF4444',         // Red-500
    warning: '#F59E0B',       // Amber-500
    info: '#3B82F6',          // Blue-500
    
    // Tab bar
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Text colors
    text: '#F8FAFC',          // Slate-50
    textSecondary: '#CBD5E1', // Slate-300
    textMuted: '#94A3B8',     // Slate-400
    
    // Background colors
    background: '#0F172A',    // Slate-900
    surface: '#1E293B',       // Slate-800
    surfaceSecondary: '#334155', // Slate-700
    
    // Brand colors - Orange
    primary: '#FB923C',       // Orange-400
    primaryLight: '#FDBA74',  // Orange-300
    primaryDark: '#F97316',   // Orange-500
    
    // Brand colors - Dark Blue
    secondary: '#3B82F6',     // Blue-500
    secondaryLight: '#60A5FA', // Blue-400
    secondaryDark: '#2563EB',  // Blue-600
    
    // Brand colors - Yellow/Amber
    accent: '#FBBF24',        // Amber-400
    accentLight: '#FCD34D',   // Amber-300
    accentDark: '#F59E0B',    // Amber-500
    
    // UI colors
    border: '#334155',        // Slate-700
    borderLight: '#1E293B',   // Slate-800
    shadow: '#020617',        // Slate-950
    
    // Status colors
    success: '#10B981',       // Green-500
    error: '#EF4444',         // Red-500
    warning: '#F59E0B',       // Amber-500
    info: '#3B82F6',          // Blue-500
    
    // Tab bar
    tint: tintColorDark,
    icon: '#CBD5E1',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
