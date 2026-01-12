import { User } from './user.types';
import { CV } from './cv.types';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCVs: number;
  processedCVs: number;
  pendingCVs: number;
  failedCVs: number;
  storageUsed: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  userId?: string;
  description: string;
  timestamp: string;
}

export interface SystemSettings {
  maxFileSize: number;
  allowedFileTypes: string[];
  maxCVsPerUser: number;
  enableAutoProcessing: boolean;
  defaultLLMProvider: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'createdAt' | 'email' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UpdateUserRoleData {
  role: string;
}

export interface UpdateUserStatusData {
  status: string;
}
