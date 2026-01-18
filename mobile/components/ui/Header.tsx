/**
 * Modular Header Component
 * Professional UI/UX with Orange, Dark Blue, Yellow palette
 * Using NativeWind for styling
 */

import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { Bell, User, Upload } from 'lucide-react-native';
import { SearchBar } from '@/components/search';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
  filterCount?: number;
  showNotifications?: boolean;
  showProfile?: boolean;
  showUpload?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onUploadPress?: () => void;
  style?: any;
  opacity?: Animated.AnimatedInterpolation<number>;
  height?: Animated.AnimatedInterpolation<number>;
}

export default function Header({
  title = 'CVThèque',
  subtitle = 'BenCenter Services',
  showSearch = true,
  searchValue = '',
  onSearchChange,
  onFilterPress,
  filterCount = 0,
  showNotifications = true,
  showProfile = true,
  showUpload = false,
  onNotificationPress,
  onProfilePress,
  onUploadPress,
  style,
  opacity,
  height,
}: HeaderProps) {
  const containerStyle = [
    style,
    opacity && { opacity },
    height && { height },
  ];

  const handleUploadPress = () => {
    if (onUploadPress) {
      onUploadPress();
    }
  };

  return (
    <Animated.View style={containerStyle} className="bg-white border-b border-slate-200 overflow-hidden">
      <View className="flex-1 pt-12 px-5">
        <View className="flex-row justify-between items-center mb-5">
          {/* Logo and Title */}
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-xl bg-white items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
              <Image 
                source={require('@/assets/images/bencenter.jpg')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View>
              <Text className="text-2xl font-bold text-slate-900 tracking-wide">{title}</Text>
              <Text className="text-sm text-slate-500 mt-0.5 font-medium">{subtitle}</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row items-center gap-3">
            {showUpload && (
              <TouchableOpacity
                className="w-10 h-10 rounded-xl bg-orange-500 items-center justify-center active:bg-orange-600"
                activeOpacity={0.7}
                onPress={handleUploadPress}
              >
                <Upload size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {showNotifications && (
              <TouchableOpacity
                className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-slate-200 relative"
                activeOpacity={0.7}
                onPress={onNotificationPress}
              >
                <Bell size={22} color="#64748B" />
                <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
              </TouchableOpacity>
            )}
            
            {showProfile && (
              <TouchableOpacity
                className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200"
                activeOpacity={0.7}
                onPress={onProfilePress}
              >
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="mb-5">
            <SearchBar
              value={searchValue}
              onChangeText={onSearchChange}
              onFilterPress={onFilterPress}
              filterCount={filterCount}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

