import type { ApiResponse, User } from '../../../shared/types';
import { apiGet } from '../../../shared/services/api';

export async function getUsers() {
  const response = await apiGet<ApiResponse<User[]>>('/users');

  return response.data;
}