import type { ApiResponse, User, UserFormData } from '../../../shared/types';
import { apiGet, apiPost, apiPut, apiPatch } from '../../../shared/services/api';

export async function getUsers() {
  const response = await apiGet<ApiResponse<User[]>>('/users');

  return response.data;
}

export async function createUser(data: UserFormData) {
  const response = await apiPost<ApiResponse<User>>('/users', data);

  return response.data;
}

export async function updateUser(id: number, data: UserFormData) {
  const response = await apiPut<ApiResponse<User>>(`/users/${id}`, data);

  return response.data;
}

export async function deactivateUser(id: number) {
  const response = await apiPatch<ApiResponse<User>>(`/users/${id}/deactivate`);

  return response.data;
}