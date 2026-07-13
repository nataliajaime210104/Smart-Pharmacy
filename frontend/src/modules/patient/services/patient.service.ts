import { apiGet } from "../../../shared/services/api";

export async function getMyPrescriptions(userId: number) {
  return apiGet<{
    success: boolean;
    data: any[];
  }>(`/patient/prescriptions/${userId}`);
}

export function getPrescriptionPdfUrl(id: number) {
  return `/api/prescriptions/${id}/pdf`;
}