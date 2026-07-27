import type {
  ApiResponse,
  LoginResponse,
  User,
} from '../../../shared/types';
import {
  apiGet,
  apiPost,
} from '../../../shared/services/api';

export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/login', {
    email,
    password,
  });
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return apiPost<LoginResponse>('/register', data);
}

export function getAuthenticatedUser() {
  return apiGet<ApiResponse<User>>('/auth/me');
}

export function logout() {
  return apiPost<{ success: boolean; message: string }>('/logout', {});
}
