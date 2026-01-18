import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const SERVER_GATEWAY_DOMAIN =
  process.env.NEXT_PUBLIC_SERVER_DOMAIN || 'http://localhost:12000';

const HTTP_TIMEOUT = 30000; // 30 seconds for CV processing

const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_GATEWAY_DOMAIN,
  credentials: 'include',
});

// BaseQuery with automatic token refresh on 401
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  console.log(`[RTK Query] baseQueryWithReauth called for:`, args);

  let result = await baseQuery(args, api, extraOptions);

  console.log(`[RTK Query] baseQuery result:`, {
    status: result.error?.status,
    error: result.error,
    data: result.data ? 'has data' : 'no data',
  });

  // If we receive a 401 error (unauthorized)
  if (result.error && result.error.status === 401) {
    console.log(`[RTK Query] Got 401, attempting token refresh...`);

    // Try to refresh the token via httpOnly cookie
    const refreshResult = await baseQuery(
      {
        url: '/api/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );

    console.log(`[RTK Query] Refresh result:`, {
      success: !!refreshResult.data,
      error: refreshResult.error,
    });

    if (refreshResult.data) {
      console.log(`[RTK Query] Token refresh successful, retrying original request...`);
      // New token is set via httpOnly cookie by backend
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log(`[RTK Query] Token refresh failed, logging out user`);
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
