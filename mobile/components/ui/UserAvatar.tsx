/**
 * User Avatar with Dropdown Component
 * Shows user profile picture with dropdown menu for profile and logout
 */

import { View, Text, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { User as UserIcon, LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logOut, User } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';

interface UserAvatarProps {
  onProfilePress?: () => void;
}

export default function UserAvatar({ onProfilePress }: UserAvatarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogoutOrLogin = () => {
    setShowDropdown(false);
    if (isAuthenticated) {
      dispatch(logOut());
      // Use push instead of replace to keep tabs in background
      router.push('/auth-modal');
    } else {
      router.push('/auth-modal');
    }
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/user-profile');
    }
  };

  return (
    <>
      <TouchableOpacity
        className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200"
        activeOpacity={0.7}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Image
          source={{ uri: user?.profilePicture || 'https://i.pravatar.cc/150?img=12' }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          className="flex-1"
          onPress={() => setShowDropdown(false)}
        >
          <View className="absolute top-16 right-4 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[160px]">
            {isAuthenticated && (
              <TouchableOpacity
                className="flex-row items-center gap-2 px-4 py-3 border-b border-slate-100"
                onPress={handleViewProfile}
                activeOpacity={0.7}
              >
                <UserIcon size={16} color="#64748B" />
                <Text className="text-sm text-slate-700">Profile</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-3"
              onPress={handleLogoutOrLogin}
              activeOpacity={0.7}
            >
              <LogOut size={16} color={isAuthenticated ? '#EF4444' : '#F97316'} />
              <Text className={`text-sm ${isAuthenticated ? 'text-red-500' : 'text-orange-500'}`}>
                {isAuthenticated ? 'Logout' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
