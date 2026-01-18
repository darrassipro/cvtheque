/**
 * Toast Notification Component
 * Displays temporary notification messages at top with orange left bar
 */

import React, { useEffect, useState } from 'react';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

const Toast = React.forwardRef<any, ToastProps>(
  ({ message, type = 'info', duration = 4000, onDismiss }, ref) => {
    const [visible, setVisible] = useState(true);
    const [translateY] = useState(new Animated.Value(-100));

    useEffect(() => {
      // Slide down
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    };

    if (!visible) return null;

    const bgColor = {
      success: '#F0FDF4',
      error: '#FEF2F2',
      warning: '#FFFBEB',
      info: '#F0F9FF',
    }[type];

    const borderColor = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    }[type];

    const textColor = {
      success: '#065F46',
      error: '#7F1D1D',
      warning: '#78350F',
      info: '#0C2340',
    }[type];

    const Icon = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertCircle,
      info: Info,
    }[type];

    return (
      <Animated.View
        style={{
          transform: [{ translateY }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
      >
        <View
          className="flex-row items-start p-4 mx-4 mt-4 rounded-lg shadow-lg"
          style={{ 
            backgroundColor: bgColor,
            borderLeftWidth: 4,
            borderLeftColor: borderColor,
          }}
        >
          <Icon size={20} color={borderColor} style={{ marginRight: 12, marginTop: 2 }} />
          <Text 
            className="flex-1 text-sm font-medium leading-5"
            style={{ color: textColor }}
            numberOfLines={3}
          >
            {message}
          </Text>
          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <X size={16} color={borderColor} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
