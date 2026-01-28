import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

export const SERVER_GATEWAY_DOMAIN = API_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_GATEWAY_DOMAIN,
  prepareHeaders: async (headers) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// BaseQuery with automatic token refresh on 401
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  console.log('[API] Making request to:', SERVER_GATEWAY_DOMAIN, args);
  let result = await baseQuery(args, api, extraOptions);
  
  console.log('[API] Response:', {
    status: result.error?.status,
    error: result.error?.data || result.error?.message,
    data: result.data ? 'has data' : 'no data',
  });

  // If we receive a 401 error (unauthorized)
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = (refreshResult.data as any).data;
        
        // Store the new tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - user needs to login again
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        api.dispatch({ type: 'auth/logOut' });
      }
    } else {
      // No refresh token - user needs to login
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      api.dispatch({ type: 'auth/logOut' });
    }
  }

  return result;
};

export default baseQueryWithReauth;
