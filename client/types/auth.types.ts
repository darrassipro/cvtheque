import { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
