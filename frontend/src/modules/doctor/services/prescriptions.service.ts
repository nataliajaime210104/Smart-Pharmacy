import type {
  ApiResponse,
  Prescription,
  PrescriptionFormData,
  StockCheckResponse,
} from '../../../shared/types';

import {
  apiGet,
  apiPost,
} from '../../../shared/services/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

export async function getPrescriptions() {
  const response = await apiGet<ApiResponse<Prescription[]>>('/prescriptions');

  return response.data;
}

export async function checkPrescriptionStock(data: PrescriptionFormData) {
  return apiPost<StockCheckResponse>('/prescriptions/check-stock', {
    items: data.items,
  });
}

export async function createPrescription(data: PrescriptionFormData) {
  const response = await apiPost<ApiResponse<Prescription>>('/prescriptions', data);

  return response.data;
}

export async function signPrescription(
  id: number,
  signatureDataUrl: string,
  signerName: string
) {
  const response = await apiPost<ApiResponse<Prescription>>(
    `/prescriptions/${id}/sign`,
    {
      signatureDataUrl,
      signerName,
    }
  );

  return response.data;
}

export function getPrescriptionPdfUrl(id: number) {
  return `${API_URL}/prescriptions/${id}/pdf`;
}

export async function dispensePrescription(id: number) {
  const response = await apiPost<ApiResponse<Prescription>>(
    `/prescriptions/${id}/dispense`,
    {}
  );

  return response.data;
}