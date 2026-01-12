import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user.types';

// Load initial state from localStorage if available
const loadAuthFromStorage = (): Pick<AuthState, 'user' | 'isAuthenticated'> => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  
  try {
    const savedUser = localStorage.getItem('cvtech_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return { user, isAuthenticated: true };
    }
  } catch (error) {
    console.error('Failed to load user from localStorage:', error);
  }
  
  return { user: null, isAuthenticated: false };
};

interface AuthCredentials {
  user: User;
  token?: string;
  refreshToken?: string;
}

export interface AuthState {
  // Modal states
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isForgotPasswordOpen: boolean;
  
  // Auth status
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  
  // User session state
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isLoginOpen: false,
  isRegisterOpen: false,
  isForgotPasswordOpen: false,
  status: 'idle',
  error: null,
  ...loadAuthFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthCredentials>) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.status = 'success';
      state.error = null;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cvtech_user', JSON.stringify(user));
        } catch (error) {
          console.error('Failed to save user to localStorage:', error);
        }
      }
    },

    logOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('cvtech_user');
        } catch (error) {
          console.error('Failed to remove user from localStorage:', error);
        }
      }
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cvtech_user', JSON.stringify(state.user));
          } catch (error) {
            console.error('Failed to update user in localStorage:', error);
          }
        }
      }
    },

    // Modal Management
    openLoginModal: (state) => {
      state.isLoginOpen = true;
      state.isRegisterOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },

    openRegisterModal: (state) => {
      state.isRegisterOpen = true;
      state.isLoginOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },

    openForgotPasswordModal: (state) => {
      state.isForgotPasswordOpen = true;
      state.isLoginOpen = false;
      state.isRegisterOpen = false;
      state.error = null;
    },

    closeAllModals: (state) => {
      state.isLoginOpen = false;
      state.isRegisterOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },

    switchToRegister: (state) => {
      state.isLoginOpen = false;
      state.isRegisterOpen = true;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },

    switchToLogin: (state) => {
      state.isRegisterOpen = false;
      state.isForgotPasswordOpen = false;
      state.isLoginOpen = true;
      state.error = null;
    },

    switchToForgotPassword: (state) => {
      state.isLoginOpen = false;
      state.isRegisterOpen = false;
      state.isForgotPasswordOpen = true;
      state.error = null;
    },

    setAuthStatus: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
      state.status = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.status = 'error';
    },

    clearAuthError: (state) => {
      state.error = null;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
  },
});

export const {
  setCredentials,
  logOut,
  updateUser,
  openLoginModal,
  openRegisterModal,
  openForgotPasswordModal,
  closeAllModals,
  switchToRegister,
  switchToLogin,
  switchToForgotPassword,
  setAuthStatus,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
