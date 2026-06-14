import type { LoginResponse } from '../../../shared/types';
import { apiPost } from '../../../shared/services/api';

export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/login', {
    email,
    password,
  });
}