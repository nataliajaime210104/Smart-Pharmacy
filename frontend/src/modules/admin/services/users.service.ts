import type {
  ApiResponse,
  User,
  UserFormData,
} from '../../../shared/types';

import {
  apiGet,
  apiPostFormData,
  apiPut,
} from '../../../shared/services/api';

function buildUserFormData(data: UserFormData, isEdit = false) {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('role', data.role);
  formData.append('status', data.status);

  if (data.password) {
    formData.append('password', data.password);
  }

  if (!isEdit && data.password) {
    formData.append('password', data.password);
  }

  if (data.patientAge !== '' && data.patientAge !== undefined && data.patientAge !== null) {
    formData.append('patientAge', String(data.patientAge));
  }

  if (data.profilePhoto) {
    formData.append('profilePhoto', data.profilePhoto);
  }

  return formData;
}

export async function getUsers() {
  const response = await apiGet<ApiResponse<User[]>>('/users');

  return response.data;
}

export async function createUser(data: UserFormData) {
  const formData = buildUserFormData(data);

  const response = await apiPostFormData<ApiResponse<User>>(
    '/users',
    formData
  );

  return response.data;
}

export async function updateUser(userId: number, data: UserFormData) {
  const formData = buildUserFormData(data, true);

  formData.append('_method', 'PUT');

  const response = await apiPostFormData<ApiResponse<User>>(
    `/users/${userId}`,
    formData
  );

  return response.data;
}

export async function deactivateUser(userId: number) {
  const response = await apiPut<ApiResponse<User>>(
    `/users/${userId}/deactivate`,
    {}
  );

  return response.data;
}