import { logger } from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/scheduler";

import { listPendingAlerts } from "../alerts.js";
import { marketData, marketDataSecrets } from "../market/index.js";
import { triggerReachedAlerts } from "../price-alerts.js";

export const priceAlertCheck = onSchedule(
  { schedule: "*/5 10-18 * * 1-5", timeZone: "America/Sao_Paulo", secrets: marketDataSecrets },
  async () => {
    const result = await triggerReachedAlerts(await listPendingAlerts(), marketData());
    logger.info("Checagem de alertas de preço concluída", result);
  },
);
