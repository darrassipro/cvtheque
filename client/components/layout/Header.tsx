'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '@/lib/store';
import { openLoginModal, openRegisterModal, logOut } from '@/lib/slices/authSlice';
import { useLogoutMutation } from '@/lib/services/authApi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, User, Settings, LogOut as LogOutIcon, Shield, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { UserRole } from '@/types/user.types';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Try to call logout on the server, but clear state regardless
      try {
        await logoutMutation().unwrap();
      } catch (err) {
        // Logout endpoint might fail due to expired session, but we still want to clear local state
        console.warn('Server logout failed, clearing local state:', err);
      }
      
      // Clear user from Redux state immediately
      dispatch(logOut());
      toast.success('Logged out successfully');
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if there's an error, clear the state
      dispatch(logOut());
      router.push('/');
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;
  const isModerator = user?.role === UserRole.MODERATOR;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CVTech</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            {isMounted && isAuthenticated && (
              <Link
                href="/cvs"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                My CVs
              </Link>
            )}
            {isMounted && (isAdmin || isModerator) && (
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Administration
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isMounted && !isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => dispatch(openLoginModal())}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button onClick={() => dispatch(openRegisterModal())}>
                  Get Started
                </Button>
              </>
            ) : isMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cvs" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      My CVs
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin || isModerator) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
