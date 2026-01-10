/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Professional UI/UX Color Palette: Cyan, Yellow, Gray
 */

import { Platform } from 'react-native';

// Professional Color Palette
const tintColorLight = '#06B6D4'; // Cyan
const tintColorDark = '#06B6D4';  // Cyan

export const Colors = {
  light: {
    // Text colors
    text: '#111827',          // Gray-900
    textSecondary: '#6B7280', // Gray-500
    textMuted: '#9CA3AF',     // Gray-400
    
    // Background colors
    background: '#F9FAFB',    // Gray-50
    surface: '#FFFFFF',       // White
    surfaceSecondary: '#F3F4F6', // Gray-100
    
    // Brand colors
    primary: '#06B6D4',       // Cyan-500
    primaryLight: '#22D3EE',  // Cyan-400
    primaryDark: '#0891B2',   // Cyan-600
    
    secondary: '#FBBF24',     // Yellow-400
    secondaryLight: '#FCD34D', // Yellow-300
    secondaryDark: '#F59E0B',  // Yellow-500
    
    // UI colors
    border: '#E5E7EB',        // Gray-200
    borderLight: '#F3F4F6',   // Gray-100
    shadow: '#9CA3AF',        // Gray-400
    
    // Status colors
    success: '#10B981',       // Green-500
    error: '#EF4444',         // Red-500
    warning: '#F59E0B',       // Yellow-500
    info: '#06B6D4',          // Cyan-500
    
    // Tab bar
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Text colors
    text: '#F9FAFB',          // Gray-50
    textSecondary: '#D1D5DB', // Gray-300
    textMuted: '#9CA3AF',     // Gray-400
    
    // Background colors
    background: '#1F2937',    // Gray-800
    surface: '#374151',       // Gray-700
    surfaceSecondary: '#4B5563', // Gray-600
    
    // Brand colors
    primary: '#06B6D4',       // Cyan-500
    primaryLight: '#22D3EE',  // Cyan-400
    primaryDark: '#0891B2',   // Cyan-600
    
    secondary: '#FBBF24',     // Yellow-400
    secondaryLight: '#FCD34D', // Yellow-300
    secondaryDark: '#F59E0B',  // Yellow-500
    
    // UI colors
    border: '#4B5563',        // Gray-600
    borderLight: '#374151',   // Gray-700
    shadow: '#111827',        // Gray-900
    
    // Status colors
    success: '#10B981',       // Green-500
    error: '#EF4444',         // Red-500
    warning: '#F59E0B',       // Yellow-500
    info: '#06B6D4',          // Cyan-500
    
    // Tab bar
    tint: tintColorDark,
    icon: '#D1D5DB',
    tabIconDefault: '#9CA3AF',
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
