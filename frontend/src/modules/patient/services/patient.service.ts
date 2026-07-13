import { apiGet } from "../../../shared/services/api";

export async function getMyPrescriptions(userId: number) {
  return apiGet<{
    success: boolean;
    data: any[];
  }>(`/patient/prescriptions/${userId}`);
}

export function getPrescriptionPdfUrl(id: number) {
  return `http://127.0.0.1:8000/api/prescriptions/${id}/pdf`;
}