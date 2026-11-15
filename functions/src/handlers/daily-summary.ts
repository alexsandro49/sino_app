import { logger } from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/scheduler";

import { marketData, marketDataSecrets } from "../market/index.js";
import { sendSummaryToUser } from "../notifications.js";
import { listProfileUserIds } from "../profile.js";

export const dailySummary = onSchedule(
  { schedule: "15 18 * * 1-5", timeZone: "America/Sao_Paulo", secrets: marketDataSecrets },
  async () => {
    const provider = marketData();
    const userIds = await listProfileUserIds();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const result = await sendSummaryToUser(userId, provider);
        if (result.status === "sent") {
          sent += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        failed += 1;
        logger.error("Falha ao enviar o resumo diário", { userId, error });
      }
    }

    logger.info("Resumo diário concluído", { users: userIds.length, sent, skipped, failed });
  },
);
