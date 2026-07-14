import type {
  ApiResponse,
  Patient,
  PatientClinicalFormData,
  PatientRegistrationFormData,
} from '../../../shared/types';

import {
  apiGet,
  apiPostFormData,
  apiPut,
} from '../../../shared/services/api';

export async function getPatients() {
  const response = await apiGet<ApiResponse<Patient[]>>('/patients');

  return response.data;
}

export async function updatePatientClinicalData(
  patientId: number,
  data: PatientClinicalFormData
) {
  const response = await apiPut<ApiResponse<Patient>>(
    `/patients/${patientId}/clinical-data`,
    data
  );

  return response.data;
}

export async function createPatientFromDoctor(
  data: PatientRegistrationFormData
) {
  const formData = new FormData();

  formData.append('fullName', data.fullName);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('password_confirmation', data.password_confirmation);

  if (data.profilePhoto) {
    formData.append('profilePhoto', data.profilePhoto);
  }

  if (data.birthDate) {
    formData.append('birthDate', data.birthDate);
  }

  if (data.age !== '' && data.age !== undefined && data.age !== null) {
    formData.append('age', String(data.age));
  }

  if (data.diagnosis) {
    formData.append('diagnosis', data.diagnosis);
  }

  if (data.allergies) {
    formData.append('allergies', data.allergies);
  }

  if (data.medicalConditions) {
    formData.append('medicalConditions', data.medicalConditions);
  }

  if (data.clinicalNotes) {
    formData.append('clinicalNotes', data.clinicalNotes);
  }

  if (data.lastTreatment) {
    formData.append('lastTreatment', data.lastTreatment);
  }

  const response = await apiPostFormData<ApiResponse<Patient>>(
    '/patients',
    formData
  );

  return response.data;
}