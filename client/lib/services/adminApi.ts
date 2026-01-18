import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import {
  DashboardStats,
  AuditLog,
  AuditLogParams,
  AuditLogResponse,
  UserListParams,
  UserListResponse,
  UpdateUserRoleData,
  UpdateUserStatusData,
  SystemSettings,
} from "@/types/admin.types";
import { User } from "@/types/user.types";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQuery,
  tagTypes: ['Dashboard', 'Users', 'User', 'AuditLogs', 'Settings', 'LLMConfigs'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<{ success: boolean; data: DashboardStats }, void>({
      query: () => ({
        url: "/api/admin/dashboard",
        method: "GET",
      }),
      providesTags: ['Dashboard'],
    }),

    // User Management
    listUsers: builder.query<UserListResponse, UserListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.page) queryParams.append('page', params.page.toString());
        if (params && params.limit) queryParams.append('limit', params.limit.toString());
        if (params && params.search) queryParams.append('search', params.search);
        if (params && params.role) queryParams.append('role', params.role);
        if (params && params.status) queryParams.append('status', params.status);
        if (params && params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params && params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        return {
          url: `/api/admin/users?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['Users'],
    }),

    getUserById: builder.query<{ success: boolean; data: User }, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUserRole: builder.mutation<{ success: boolean; data: User }, { id: string; data: UpdateUserRoleData }>({
      query: ({ id, data }) => ({
        url: `/api/admin/users/${id}/role`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'Users',
        'Dashboard'
      ],
    }),

    updateUserStatus: builder.mutation<{ success: boolean; data: User }, { id: string; data: UpdateUserStatusData }>({
      query: ({ id, data }) => ({
        url: `/api/admin/users/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'Users',
        'Dashboard'
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Users', 'Dashboard'],
    }),

    // Audit Logs
    getAuditLogs: builder.query<AuditLogResponse, AuditLogParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.page) queryParams.append('page', params.page.toString());
        if (params && params.limit) queryParams.append('limit', params.limit.toString());
        if (params && params.userId) queryParams.append('userId', params.userId);
        if (params && params.action) queryParams.append('action', params.action);
        if (params && params.resource) queryParams.append('resource', params.resource);
        if (params && params.startDate) queryParams.append('startDate', params.startDate);
        if (params && params.endDate) queryParams.append('endDate', params.endDate);

        return {
          url: `/api/admin/audit-logs?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['AuditLogs'],
    }),

    // System Settings
    getSystemSettings: builder.query<{ success: boolean; data: SystemSettings }, void>({
      query: () => ({
        url: "/api/admin/settings",
        method: "GET",
      }),
      providesTags: ['Settings'],
    }),

    updateSystemSetting: builder.mutation<{ success: boolean; data: any }, { key: string; value: any }>({
      query: (data) => ({
        url: "/api/admin/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // LLM Configuration
    getLLMConfigs: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => ({
        url: "/api/llm-config",
        method: "GET",
      }),
      providesTags: ['LLMConfigs'],
    }),

    createLLMConfig: builder.mutation<{ success: boolean; data: any }, any>({
      query: (body) => ({
        url: "/api/llm-config",
        method: "POST",
        body,
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    updateLLMConfig: builder.mutation<{ success: boolean; data: any }, { id: string; [key: string]: any }>({
      query: ({ id, ...updates }) => ({
        url: `/api/llm-config/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    deleteLLMConfig: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    setDefaultLLMConfig: builder.mutation<{ success: boolean; data: any }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}/set-default`,
        method: "POST",
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    testLLMConfig: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}/test`,
        method: "POST",
      }),
    }),

    toggleLLMProcessing: builder.mutation<{ success: boolean; data: any }, { enabled: boolean }>({
      query: ({ enabled }) => ({
        url: "/api/admin/settings",
        method: "PUT",
        body: { llmEnabled: enabled },
      }),
      invalidatesTags: ['Settings'],
    }),

    updateSystemSettings: builder.mutation<{ success: boolean; data: any }, Partial<SystemSettings>>({
      query: (data) => ({
        url: "/api/admin/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Health Check
    healthCheck: builder.query<{ success: boolean; data: any }, void>({
      query: () => ({
        url: "/api/admin/health",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useListUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAuditLogsQuery,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useGetLLMConfigsQuery,
  useCreateLLMConfigMutation,
  useUpdateLLMConfigMutation,
  useDeleteLLMConfigMutation,
  useSetDefaultLLMConfigMutation,
  useTestLLMConfigMutation,
  useToggleLLMProcessingMutation,
  useUpdateSystemSettingsMutation,
  useHealthCheckQuery,
} = adminApi;

export default adminApi;
