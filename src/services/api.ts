import { getIdToken } from "@/services/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export async function apiGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const response = await fetch(`${API_URL}${path}?${query}`, {
    headers: { Authorization: `Bearer ${await getIdToken()}` },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível falar com o servidor.");
  }

  return body as T;
}
