const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${response.statusText} — ${body}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
