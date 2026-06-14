const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al consultar la API.');
  }

  return response.json();
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ?? 'Error al enviar información a la API.'
    );
  }

  return response.json();
}