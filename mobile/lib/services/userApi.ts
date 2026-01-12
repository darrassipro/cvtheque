import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../api/baseQuery';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/api/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/api/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation({
      query: (data: { currentPassword: string; newPassword: string }) => ({
        url: '/api/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;
