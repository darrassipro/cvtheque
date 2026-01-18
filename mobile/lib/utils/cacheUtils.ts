/**
 * Cache utilities for clearing RTK Query caches
 * Useful when debugging or when database is reset
 */

import { store } from '../store';
import { cvApi } from '../services/cvApi';
import { userApi } from '../services/userApi';
import { authApi } from '../services/authApi';
import { adminApi } from '../services/adminApi';

/**
 * Clear all RTK Query caches
 * Use this when:
 * - Database is reset/dropped
 * - Data is stale and needs refresh
 * - User logs out
 */
export function clearAllCaches() {
  console.log('[cacheUtils] Clearing all RTK Query caches');
  
  store.dispatch(cvApi.util.resetApiState());
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(authApi.util.resetApiState());
  store.dispatch(adminApi.util.resetApiState());
  
  console.log('[cacheUtils] All caches cleared');
}

/**
 * Clear specific API cache
 */
export function clearCVCache() {
  console.log('[cacheUtils] Clearing CV cache');
  store.dispatch(cvApi.util.resetApiState());
}

export function clearUserCache() {
  console.log('[cacheUtils] Clearing User cache');
  store.dispatch(userApi.util.resetApiState());
}

export function clearAuthCache() {
  console.log('[cacheUtils] Clearing Auth cache');
  store.dispatch(authApi.util.resetApiState());
}
