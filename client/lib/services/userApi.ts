import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import { User, UpdateProfileData, ChangePasswordData } from "@/types/user.types";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; data: User }, void>({
      query: () => ({
        url: "/api/users/profile",
        method: "GET",
      }),
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<{ success: boolean; data: User }, UpdateProfileData>({
      query: (data) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    updateAvatar: builder.mutation<{ success: boolean; data: User }, FormData>({
      query: (formData) => ({
        url: "/api/users/avatar",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordData>({
      query: (data) => ({
        url: "/api/users/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    deleteAccount: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/api/users/account",
        method: "DELETE",
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;

export default userApi;
