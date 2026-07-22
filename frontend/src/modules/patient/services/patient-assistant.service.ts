import { apiPost } from '../../../shared/services/api';

interface PatientAssistantRequest {
  question: string;
  userId: number;
}

interface PatientAssistantResponse {
  success: boolean;
  answer: string;
  source?: string;
}

export async function askPatientAssistant(
  data: PatientAssistantRequest
) {
  return apiPost<PatientAssistantResponse>(
    '/patient/assistant',
    data
  );
}
