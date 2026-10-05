import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { setGlobalOptions } from "firebase-functions";
import { onRequest, type Request } from "firebase-functions/https";
import { logger } from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";

import { getQuotes, searchTickers } from "./brapi.js";

initializeApp();

setGlobalOptions({ region: "southamerica-east1", maxInstances: 5 });

const brapiToken = defineSecret("BRAPI_TOKEN");

const SYMBOL_PATTERN = /^[A-Z0-9]{4,7}$/;
const MAX_SYMBOLS = 20;
const MAX_QUERY_LENGTH = 30;
const SEARCH_LIMIT = 15;

async function isAuthenticated(req: Request): Promise<boolean> {
  const header = req.get("Authorization") ?? "";
  const [scheme, idToken] = header.split(" ");

  if (scheme !== "Bearer" || !idToken) {
    return false;
  }

  try {
    await getAuth().verifyIdToken(idToken);
    return true;
  } catch {
    return false;
  }
}

function parseSymbols(raw: unknown): string[] {
  if (typeof raw !== "string") {
    return [];
  }

  const symbols = raw
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => SYMBOL_PATTERN.test(symbol));

  return [...new Set(symbols)].slice(0, MAX_SYMBOLS);
}

export const api = onRequest({ secrets: [brapiToken], cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  try {
    if (req.path === "/tickers") {
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

      if (!query) {
        res.json({ tickers: [] });
        return;
      }

      const tickers = await searchTickers(query.slice(0, MAX_QUERY_LENGTH), SEARCH_LIMIT);
      res.json({ tickers });
      return;
    }

    if (req.path === "/quotes") {
      const symbols = parseSymbols(req.query.symbols);
      res.json(await getQuotes(symbols, brapiToken.value()));
      return;
    }

    res.status(404).json({ error: "Rota não encontrada." });
  } catch (error) {
    logger.error("Falha ao consultar a brapi", error);
    res.status(502).json({ error: "Não foi possível consultar a bolsa agora." });
  }
});
