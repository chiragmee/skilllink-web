/**
 * Centralized API client for SkillLink backend.
 *
 * Handles:
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Auth token injection (from localStorage, updated when Supabase auth is added)
 * - Render free-tier cold-start: first request can take 30–60s; retries once on 503
 * - Typed response + error unwrapping
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('skilllink_token');
}

interface ApiOptions extends RequestInit {
  /** Skip auth header injection (e.g., for public endpoints) */
  skipAuth?: boolean;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;

  const attempt = async (retrying = false): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(url, { ...fetchOptions, headers });
    } catch (networkErr) {
      throw new Error(`Network error: ${(networkErr as Error).message}`);
    }

    // Render cold-start: 503 on first hit → wait 5s and retry once
    if (res.status === 503 && !retrying) {
      await new Promise((r) => setTimeout(r, 5000));
      return attempt(true);
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        message = body.message || body.error || message;
      } catch {}
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  };

  return attempt();
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) =>
    request<T>(path, { method: 'GET', ...opts }),

  post: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),

  patch: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: ApiOptions) =>
    request<T>(path, { method: 'DELETE', ...opts }),
};

/**
 * Check if the backend is awake. Returns true if healthy within 3s.
 * Used by the cold-start banner to avoid showing it unnecessarily.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
