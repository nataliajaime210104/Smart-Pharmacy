import type {
  AiAssistantRequest,
  AiAssistantResponse,
  ApiResponse,
} from '../../../shared/types';

import { apiPost } from '../../../shared/services/api';

export async function askAiAssistant(data: AiAssistantRequest) {
  const response = await apiPost<ApiResponse<AiAssistantResponse>>(
    '/ai-assistant/ask',
    data
  );

  return response.data;
}