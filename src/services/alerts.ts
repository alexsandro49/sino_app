import { apiDelete, apiGet, apiPost } from "@/services/api";

export type AlertDirection = "above" | "below";

export type PriceAlert = {
  id: string;
  symbol: string;
  direction: AlertDirection;
  targetPrice: number;
  createdAt: string;
  triggeredAt: string | null;
  triggeredPrice: number | null;
};

type AlertsResponse = {
  alerts: PriceAlert[];
};

export async function fetchAlerts(): Promise<PriceAlert[]> {
  const { alerts } = await apiGet<AlertsResponse>("/alerts");
  return alerts;
}

export async function createAlert(symbol: string, direction: AlertDirection, targetPrice: number): Promise<PriceAlert[]> {
  const { alerts } = await apiPost<AlertsResponse>("/alerts", { symbol, direction, targetPrice });
  return alerts;
}

export async function deleteAlert(alertId: string): Promise<PriceAlert[]> {
  const { alerts } = await apiDelete<AlertsResponse>(`/alerts/${encodeURIComponent(alertId)}`);
  return alerts;
}

export function parsePrice(text: string): number | null {
  const normalized = text.trim().replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);

  return normalized !== "" && Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}
