'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import { LayoutDashboard, Users, FileText, Settings, Activity } from 'lucide-react';

export default function AdminPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check if user is admin or moderator
  if (!isAuthenticated || !user) {
    redirect('/');
  }

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;
  const isModerator = user.role === UserRole.MODERATOR;

  if (!isAdmin && !isModerator) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="cvs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CVs
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="cvs">
          <div className="text-center py-12 text-gray-500">
            CV Management coming soon...
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <div className="text-center py-12 text-gray-500">
              System Settings coming soon...
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
