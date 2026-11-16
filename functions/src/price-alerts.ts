import { logger } from "firebase-functions/logger";

import { markAlertTriggered, type OwnedPriceAlert } from "./alerts.js";
import type { MarketDataProvider } from "./market/index.js";
import { sendPushMessages, type PushMessage } from "./notifications.js";
import { getProfile, removePushTokens } from "./profile.js";

export type AlertCheckResult = {
  checked: number;
  triggered: number;
  failed: number;
};

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function hasReachedTarget(alert: OwnedPriceAlert, price: number): boolean {
  return alert.direction === "above" ? price >= alert.targetPrice : price <= alert.targetPrice;
}

function alertSentence(alert: OwnedPriceAlert, price: number): string {
  const side = alert.direction === "above" ? "acima" : "abaixo";
  const current = priceFormatter.format(price);
  const target = priceFormatter.format(alert.targetPrice);

  return `${alert.symbol} está em ${current}, ${side} do seu alerta de ${target}.`;
}

async function notifyAlert(alert: OwnedPriceAlert, price: number): Promise<void> {
  const { pushTokens } = await getProfile(alert.userId);

  if (pushTokens.length === 0) {
    return;
  }

  const body = alertSentence(alert, price);
  const messages: PushMessage[] = pushTokens.map((to) => ({
    to,
    title: "Alerta de preço",
    body,
    sound: "default",
    data: { screen: "ticker", symbol: alert.symbol },
  }));

  const { invalidTokens } = await sendPushMessages(messages);
  await removePushTokens(alert.userId, invalidTokens);
}

export async function triggerReachedAlerts(
  alerts: OwnedPriceAlert[],
  marketData: MarketDataProvider,
): Promise<AlertCheckResult> {
  const result: AlertCheckResult = { checked: alerts.length, triggered: 0, failed: 0 };

  if (alerts.length === 0) {
    return result;
  }

  const symbols = [...new Set(alerts.map((alert) => alert.symbol))];
  const { quotes } = await marketData.getQuotes(symbols);
  const priceBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote.price]));

  for (const alert of alerts) {
    const price = priceBySymbol.get(alert.symbol);

    if (price === undefined || !hasReachedTarget(alert, price)) {
      continue;
    }

    try {
      await notifyAlert(alert, price);
      await markAlertTriggered(alert.id, price);
      alert.triggeredAt = new Date().toISOString();
      alert.triggeredPrice = price;
      result.triggered += 1;
    } catch (error) {
      result.failed += 1;
      logger.error("Falha ao disparar o alerta de preço", { alertId: alert.id, error });
    }
  }

  return result;
}
