import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../api/baseQuery';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['Profile', 'User', 'ProfileCV', 'UserCVs'],
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
    uploadProfileAvatar: builder.mutation({
      query: (formData: FormData) => ({
        url: '/api/users/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    getProfileCV: builder.query({
      query: () => '/api/users/profile/cv',
      providesTags: ['ProfileCV'],
    }),
    updateProfileCV: builder.mutation({
      query: (data) => ({
        url: '/api/users/profile/cv',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ProfileCV'],
    }),
    listUserCVs: builder.query({
      query: () => '/api/users/profile/cvs',
      providesTags: ['UserCVs'],
    }),
    setDefaultCV: builder.mutation({
      query: (cvId) => ({
        url: `/api/users/profile/cvs/${cvId}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['UserCVs', 'ProfileCV'],
    }),
    deleteCV: builder.mutation({
      query: (cvId) => ({
        url: `/api/users/profile/cvs/${cvId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserCVs', 'ProfileCV'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    changePassword: builder.mutation({
      query: (data: { currentPassword: string; newPassword: string }) => ({
        url: '/api/users/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    searchUsers: builder.query({
      query: (params: { search?: string; role?: string; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.role) queryParams.append('role', params.role);
        queryParams.append('limit', String(params.limit || 50));
        return `/api/users?${queryParams.toString()}`;
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileAvatarMutation,
  useGetProfileCVQuery,
  useUpdateProfileCVMutation,
  useListUserCVsQuery,
  useSetDefaultCVMutation,
  useDeleteCVMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useSearchUsersQuery,
} = userApi;

