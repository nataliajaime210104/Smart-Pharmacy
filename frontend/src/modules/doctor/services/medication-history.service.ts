import { apiGet } from '../../../shared/services/api';

import type { ApiResponse } from '../../../shared/types';
import type {
  MedicationHistoryData,
  MedicationHistoryFilters,
  MedicationHistoryPatient,
} from '../../../shared/types/medicationHistory';

export async function getMedicationHistoryPatients(doctorId: number) {
  const response = await apiGet<ApiResponse<MedicationHistoryPatient[]>>(
    `/doctor/medication-history/patients/${doctorId}`
  );

  return response.data ?? [];
}

export async function getMedicationHistory(
  filters: MedicationHistoryFilters
) {
  const query = new URLSearchParams({
    doctorId: String(filters.doctorId),
    patientId: String(filters.patientId),
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const response = await apiGet<ApiResponse<MedicationHistoryData>>(
    `/doctor/medication-history?${query.toString()}`
  );

  return response.data;
}
