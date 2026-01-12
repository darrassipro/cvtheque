import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { authApi } from './services/authApi';
import { userApi } from './services/userApi';
import { cvApi } from './services/cvApi';
import { adminApi } from './services/adminApi';
import { llmConfigApi } from './services/llmConfigApi';

const configurestore = configureStore({
  reducer: {
    // Slices
    auth: authReducer,
    ui: uiReducer,
    
    // API Services
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [cvApi.reducerPath]: cvApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [llmConfigApi.reducerPath]: llmConfigApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['auth.user'],
        ignoredActions: [],
      },
    })
      .concat(
        authApi.middleware,
        userApi.middleware,
        cvApi.middleware,
        adminApi.middleware,
        llmConfigApi.middleware
      ),
});

export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;

