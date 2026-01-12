import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse, LogoutResponse } from "@/types/auth.types";
import { User } from "@/types/user.types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/api/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
      }),
    }),

    getCurrentUser: builder.query<{ success: boolean; data: User }, void>({
      query: () => ({
        url: "/api/auth/me",
        method: "GET",
      }),
      providesTags: ['User'],
    }),

    requestPasswordReset: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (data) => ({
        url: "/api/auth/request-password-reset",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string }, { token: string; newPassword: string }>({
      query: (data) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: (data) => ({
        url: "/api/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi;

export default authApi;
