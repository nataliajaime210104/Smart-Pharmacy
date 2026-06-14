import type { ApiResponse, Patient } from '../../../shared/types';
import { apiGet } from '../../../shared/services/api';

export async function getPatients() {
  const response = await apiGet<ApiResponse<Patient[]>>('/patients');

  return response.data;
}   