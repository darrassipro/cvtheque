import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const SERVER_GATEWAY_DOMAIN =
  process.env.NEXT_PUBLIC_SERVER_DOMAIN || 'http://localhost:12000';

const HTTP_TIMEOUT = 30000; // 30 seconds for CV processing

const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_GATEWAY_DOMAIN,
  credentials: 'include',
  fetchFn: async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      throw error;
    }
  },
  prepareHeaders: async (headers) => {
    // Tokens are automatically sent via httpOnly cookies
    // No need to manually add Authorization header
    return headers;
  },
});

// BaseQuery with automatic token refresh on 401
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we receive a 401 error (unauthorized)
  if (result.error && result.error.status === 401) {
    // Try to refresh the token via httpOnly cookie
    const refreshResult = await baseQuery(
      {
        url: '/api/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      // New token is set via httpOnly cookie by backend
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - user needs to login again
      if (typeof window !== 'undefined') {
        // Clear user state and redirect to home
        api.dispatch({ type: 'auth/logOut' });
      }
    }
  }
  
  return result;
};

export default baseQueryWithReauth;
