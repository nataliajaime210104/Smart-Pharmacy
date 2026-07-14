const API_URL = import.meta.env.VITE_API_URL ?? '/api';

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

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}