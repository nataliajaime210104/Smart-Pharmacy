import type { LoginResponse } from '../../../shared/types';
import { apiPost } from '../../../shared/services/api';

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