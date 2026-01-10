/**
 * Layout des Tabs
 * UI/UX Premium - Design épuré avec un seul tab visible
 * Le tab Explore est caché car utilisé uniquement pour l'onboarding
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Home, Search, Briefcase, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1.5,
          borderColor: '#FBBF24',
          borderRadius: 28,
          height: 56,
          paddingBottom: 4,
          paddingTop: 4,
          paddingHorizontal: 16,
          elevation: 0,
          shadowColor: 'transparent',
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 0,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
        },
      }}
    >
      {/* Tab Home - CVThèque principale */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 46,
                height: 46,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? '#06B6D4' : 'transparent',
                borderRadius: 23,
              }}
            >
              <Home 
                size={23} 
                color={focused ? '#FFFFFF' : '#6B7280'} 
                strokeWidth={focused ? 2.2 : 2} 
              />
            </View>
          ),
        }}
      />

      {/* Tab Explore - CACHÉ (utilisé pour onboarding uniquement) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Cache complètement ce tab
        }}
      />
    </Tabs>
  );
}