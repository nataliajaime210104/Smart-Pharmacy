import { apiGet } from '../../../shared/services/api';

import type {
  ApiResponse,
  PatientPrescription,
} from '../../../shared/types';

export async function getMyPrescriptions(userId: number) {
  const response = await apiGet<ApiResponse<PatientPrescription[]>>(
    `/patient/prescriptions/${userId}`
  );

  return response.data ?? [];
}