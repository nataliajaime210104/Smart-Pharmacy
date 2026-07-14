import type {
  ApiResponse,
  Patient,
  PatientClinicalFormData,
  PatientRegistrationFormData,
} from '../../../shared/types';

import {
  apiGet,
  apiPost,
  apiPut,
} from '../../../shared/services/api';

export async function getPatients() {
  const response = await apiGet<ApiResponse<Patient[]>>('/patients');

  return response.data;
}

export async function updatePatientClinicalData( patientId: number, data: PatientClinicalFormData) {
  const response = await apiPut<ApiResponse<Patient>>(
    `/patients/${patientId}/clinical-data`,
    data
  );

  return response.data;
}

export async function createPatientFromDoctor(data: PatientRegistrationFormData) {
  const response = await apiPost<ApiResponse<Patient>>('/patients', data);

  return response.data;
}