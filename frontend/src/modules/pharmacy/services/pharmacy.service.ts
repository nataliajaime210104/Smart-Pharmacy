import type {
  ApiResponse,
  InventoryFormData,
  InventoryItem,
  Medicine,
  MedicineFormData,
} from '../../../shared/types';

import {
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from '../../../shared/services/api';

export async function getMedicines() {
  const response = await apiGet<ApiResponse<Medicine[]>>('/medicines');

  return response.data;
}

export async function createMedicine(data: MedicineFormData) {
  const response = await apiPost<ApiResponse<Medicine>>('/medicines', data);

  return response.data;
}

export async function updateMedicine(id: number, data: MedicineFormData) {
  const response = await apiPut<ApiResponse<Medicine>>(`/medicines/${id}`, data);

  return response.data;
}

export async function deactivateMedicine(id: number) {
  const response = await apiPatch<ApiResponse<Medicine>>(`/medicines/${id}/deactivate`);

  return response.data;
}

export async function getInventory() {
  const response = await apiGet<ApiResponse<InventoryItem[]>>('/inventory');

  return response.data;
}

export async function getLowStockInventory() {
  const response = await apiGet<ApiResponse<InventoryItem[]>>('/inventory/low-stock');

  return response.data;
}

export async function createInventoryItem(data: InventoryFormData) {
  const response = await apiPost<ApiResponse<InventoryItem>>('/inventory', data);

  return response.data;
}

export async function updateInventoryItem(id: number, data: InventoryFormData) {
  const response = await apiPut<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);

  return response.data;
}

export async function deactivateInventoryItem(id: number) {
  const response = await apiPatch<ApiResponse<InventoryItem>>(`/inventory/${id}/deactivate`);

  return response.data;
}