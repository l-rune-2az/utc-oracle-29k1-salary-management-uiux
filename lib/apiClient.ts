import { apiConfig } from '@/config/publicConfig';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends RequestInit {
  method?: HttpMethod;
}

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const baseUrl = apiConfig.baseUrl || '';
  if (baseUrl.endsWith('/') && path.startsWith('/')) {
    return `${baseUrl.slice(0, -1)}${path}`;
  }
  return `${baseUrl}${path}`;
};

export async function apiFetch<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(
        errorPayload?.error || `API request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

