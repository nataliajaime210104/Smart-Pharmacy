import { apiGet, apiPatch } from '../../../shared/services/api';

import type {
  ApiResponse,
  PatientPrescription,
} from '../../../shared/types';

import type { MedicationSchedule } from '../../../shared/types/medicationSchedule';

export async function getMyPrescriptions(userId: number) {
  const response = await apiGet<ApiResponse<PatientPrescription[]>>(
    `/patient/prescriptions/${userId}`
  );

  return response.data ?? [];
}

export async function getMySchedules(userId: number) {
  return apiGet<ApiResponse<MedicationSchedule[]>>(
    `/patient/schedules/${userId}`
  );
}

export async function markScheduleAsTaken(scheduleId: number) {
  return apiPatch<{
    success: boolean;
    message: string;
  }>(`/patient/schedules/${scheduleId}/taken`, {});
}
