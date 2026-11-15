import type { Response } from "express";
import { getAuth } from "firebase-admin/auth";
import type { Request } from "firebase-functions/https";
import { logger } from "firebase-functions/logger";

export type AuthenticatedHandler = (req: Request, res: Response, userId: string) => Promise<void>;

async function authenticatedUserId(req: Request): Promise<string | null> {
  const header = req.get("Authorization") ?? "";
  const [scheme, idToken] = header.split(" ");

  if (scheme !== "Bearer" || !idToken) {
    return null;
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

export function routePath(req: Request): string {
  return req.path.replace(/\/+$/, "") || "/";
}

export function notFound(res: Response): void {
  res.status(404).json({ error: "Rota não encontrada." });
}

export function authenticated(handler: AuthenticatedHandler) {
  return async (req: Request, res: Response): Promise<void> => {
    const userId = await authenticatedUserId(req);

    if (!userId) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    try {
      await handler(req, res, userId);
    } catch (error) {
      logger.error("Falha ao processar a requisição", error);
      res.status(502).json({ error: "Não foi possível completar a operação agora." });
    }
  };
}
