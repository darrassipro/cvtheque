import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../api/baseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['Dashboard', 'Users'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/api/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
    listUsers: builder.query({
      query: (params: any = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);

        return `/api/admin/users?${queryParams.toString()}`;
      },
      providesTags: ['Users'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/admin/users/${id}/role`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users', 'Dashboard'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/admin/users/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useListUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = adminApi;
