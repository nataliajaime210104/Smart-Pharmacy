import { apiGet, apiPatch } from "../../../shared/services/api";

export async function getMyPrescriptions(userId: number) {
  return apiGet<{
    success: boolean;
    data: any[];
  }>(`/patient/prescriptions/${userId}`);
}

export async function getMySchedules(userId: number) {
  return apiGet<{
    success: boolean;
    data: any[];
  }>(`/patient/schedules/${userId}`);
}

export async function markScheduleAsTaken(scheduleId: number) {
  return apiPatch<{
    success: boolean;
    message: string;
  }>(`/patient/schedules/${scheduleId}/taken`, {});
}

export function getPrescriptionPdfUrl(id: number) {
  return `http://127.0.0.1:8000/api/prescriptions/${id}/pdf`;
}