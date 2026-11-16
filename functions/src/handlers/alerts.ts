import { onRequest } from "firebase-functions/https";

import { createAlert, deleteAlert, isAlertDirection, listAlerts, type NewPriceAlert } from "../alerts.js";
import { authenticated, notFound, routePath } from "../http.js";
import { marketData, marketDataSecrets } from "../market/index.js";
import { triggerReachedAlerts } from "../price-alerts.js";
import { SYMBOL_PATTERN } from "../validation.js";

const MAX_PENDING_ALERTS = 20;
const MAX_TARGET_PRICE = 1_000_000;
const ITEM_PATH = /^\/([A-Za-z0-9]{1,40})$/;

function parseNewAlert(raw: unknown): NewPriceAlert | null {
  const body = raw as { symbol?: unknown; direction?: unknown; targetPrice?: unknown } | null;
  const symbol = typeof body?.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  const targetPrice = typeof body?.targetPrice === "number" ? Math.round(body.targetPrice * 100) / 100 : NaN;

  if (!SYMBOL_PATTERN.test(symbol) || !isAlertDirection(body?.direction)) {
    return null;
  }

  if (!Number.isFinite(targetPrice) || targetPrice <= 0 || targetPrice > MAX_TARGET_PRICE) {
    return null;
  }

  return { symbol, direction: body.direction, targetPrice };
}

export const alerts = onRequest(
  { secrets: marketDataSecrets, cors: true },
  authenticated(async (req, res, userId) => {
    const path = routePath(req);

    if (req.method === "GET" && path === "/") {
      res.json({ alerts: await listAlerts(userId) });
      return;
    }

    if (req.method === "POST" && path === "/") {
      const newAlert = parseNewAlert(req.body);

      if (!newAlert) {
        res.status(400).json({ error: "Alerta inválido." });
        return;
      }

      const existing = await listAlerts(userId);

      if (existing.filter((alert) => alert.triggeredAt === null).length >= MAX_PENDING_ALERTS) {
        res.status(400).json({ error: `Você já tem ${MAX_PENDING_ALERTS} alertas ativos.` });
        return;
      }

      const provider = marketData();
      const { quotes } = await provider.getQuotes([newAlert.symbol]);

      if (quotes.length === 0) {
        res.status(400).json({ error: `Não encontramos a cotação de ${newAlert.symbol}.` });
        return;
      }

      const created = await createAlert(userId, newAlert);
      await triggerReachedAlerts([created], provider);
      res.status(201).json({ alerts: await listAlerts(userId) });
      return;
    }

    const itemMatch = ITEM_PATH.exec(path);
    if (req.method === "DELETE" && itemMatch) {
      if (!(await deleteAlert(userId, itemMatch[1]))) {
        res.status(404).json({ error: "Alerta não encontrado." });
        return;
      }

      res.json({ alerts: await listAlerts(userId) });
      return;
    }

    notFound(res);
  }),
);
