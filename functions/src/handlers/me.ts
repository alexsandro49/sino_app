import { onRequest } from "firebase-functions/https";

import { authenticated, notFound, routePath } from "../http.js";
import { marketData, marketDataSecrets } from "../market/index.js";
import { sendSummaryToUser } from "../notifications.js";
import { addPushToken, getProfile, isNotificationMode, removePushTokens, setNotificationMode } from "../profile.js";

const PUSH_TOKEN_PATTERN = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$/;

export const me = onRequest(
  { secrets: marketDataSecrets, cors: true },
  authenticated(async (req, res, userId) => {
    const path = routePath(req);

    if (req.method === "GET" && path === "/preferences") {
      const { notificationMode } = await getProfile(userId);
      res.json({ notificationMode });
      return;
    }

    if (req.method === "PUT" && path === "/preferences") {
      const mode = req.body?.notificationMode;

      if (!isNotificationMode(mode)) {
        res.status(400).json({ error: "Tipo de notificação inválido." });
        return;
      }

      await setNotificationMode(userId, mode);
      res.json({ notificationMode: mode });
      return;
    }

    if ((req.method === "POST" || req.method === "DELETE") && path === "/push-tokens") {
      const token = typeof req.body?.token === "string" ? req.body.token : "";

      if (!PUSH_TOKEN_PATTERN.test(token)) {
        res.status(400).json({ error: "Token de notificação inválido." });
        return;
      }

      if (req.method === "POST") {
        await addPushToken(userId, token);
      } else {
        await removePushTokens(userId, [token]);
      }
      res.status(204).send();
      return;
    }

    if (req.method === "POST" && path === "/summary") {
      res.json(await sendSummaryToUser(userId, marketData()));
      return;
    }

    notFound(res);
  }),
);
