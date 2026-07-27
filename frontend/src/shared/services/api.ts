import { getAuthToken } from './auth-storage';

export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    let message =
      responseData?.message ??
      'Ocurrió un error al comunicarse con la API.';

    if (responseData?.errors) {
      const validationMessages = Object.values(responseData.errors)
        .flat()
        .filter(Boolean)
        .join(' ');

      if (validationMessages) {
        message = validationMessages;
      }
    }

    throw new Error(message);
  }

  return responseData;
}

function buildHeaders(options: {
  json?: boolean;
  authenticated?: boolean;
} = {}): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.json) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.authenticated !== false) {
    const token = getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: buildHeaders(),
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: buildHeaders({ json: true }),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: buildHeaders({ json: true }),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiPostFormData<T>(endpoint: string, data: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: data,
  });

  return handleResponse<T>(response);
}
