import { getIdToken } from "@/services/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

type RequestOptions = {
  params?: Record<string, string>;
  body?: unknown;
};

function buildQuery(params: Record<string, string> | undefined) {
  if (!params) return "";

  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}

async function apiRequest<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await getIdToken()}`,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}${buildQuery(options.params)}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível falar com o servidor.");
  }

  return body as T;
}

export function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  return apiRequest<T>("GET", path, { params });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>("POST", path, { body });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>("DELETE", path);
}
