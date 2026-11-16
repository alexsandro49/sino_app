import { useEffect, useState } from "react";

import { createAlert, deleteAlert, fetchAlerts, type AlertDirection, type PriceAlert } from "@/services/alerts";

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function usePriceAlerts(symbol: string) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAlerts()
      .then((stored) => {
        if (!cancelled) setAlerts(stored);
      })
      .catch((err) => {
        if (!cancelled) setError(messageOf(err, "Não foi possível carregar seus alertas."));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function add(direction: AlertDirection, targetPrice: number): Promise<boolean> {
    setSaving(true);
    try {
      setAlerts(await createAlert(symbol, direction, targetPrice));
      setError(null);
      return true;
    } catch (err) {
      setError(messageOf(err, "Não foi possível criar o alerta."));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(alertId: string) {
    const previous = alerts;
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
    try {
      setAlerts(await deleteAlert(alertId));
      setError(null);
    } catch (err) {
      setAlerts(previous);
      setError(messageOf(err, "Não foi possível remover o alerta."));
    }
  }

  return {
    alerts: alerts.filter((alert) => alert.symbol === symbol),
    saving,
    error,
    add,
    remove,
  };
}
