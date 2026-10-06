import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { setGlobalOptions } from "firebase-functions";
import { onRequest, type Request } from "firebase-functions/https";
import { logger } from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";

import { getQuotes, searchTickers } from "./brapi.js";
import { addToWatchlist, listWatchlist, removeFromWatchlist } from "./watchlist.js";

initializeApp();

setGlobalOptions({ region: "southamerica-east1", maxInstances: 5 });

const brapiToken = defineSecret("BRAPI_TOKEN");

const SYMBOL_PATTERN = /^[A-Z0-9]{4,7}$/;
const MAX_SYMBOLS = 20;
const MAX_QUERY_LENGTH = 30;
const MAX_NAME_LENGTH = 120;
const SEARCH_LIMIT = 15;
const WATCHLIST_ITEM_PATH = /^\/watchlist\/([A-Za-z0-9]+)$/;

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
  const userId = await authenticatedUserId(req);

  if (!userId) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  try {
    if (req.method === "GET" && req.path === "/tickers") {
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

      if (!query) {
        res.json({ tickers: [] });
        return;
      }

      const tickers = await searchTickers(query.slice(0, MAX_QUERY_LENGTH), SEARCH_LIMIT);
      res.json({ tickers });
      return;
    }

    if (req.method === "GET" && req.path === "/quotes") {
      const symbols = parseSymbols(req.query.symbols);
      res.json(await getQuotes(symbols, brapiToken.value()));
      return;
    }

    if (req.method === "GET" && req.path === "/watchlist") {
      res.json({ tickers: await listWatchlist(userId) });
      return;
    }

    if (req.method === "POST" && req.path === "/watchlist") {
      const symbol = typeof req.body?.symbol === "string" ? req.body.symbol.trim().toUpperCase() : "";
      const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, MAX_NAME_LENGTH) : "";

      if (!SYMBOL_PATTERN.test(symbol)) {
        res.status(400).json({ error: "Ticker inválido." });
        return;
      }

      await addToWatchlist(userId, { symbol, name: name || symbol });
      res.status(201).json({ tickers: await listWatchlist(userId) });
      return;
    }

    const itemMatch = WATCHLIST_ITEM_PATH.exec(req.path);
    if (req.method === "DELETE" && itemMatch) {
      const symbol = itemMatch[1].toUpperCase();

      if (!SYMBOL_PATTERN.test(symbol)) {
        res.status(400).json({ error: "Ticker inválido." });
        return;
      }

      await removeFromWatchlist(userId, symbol);
      res.json({ tickers: await listWatchlist(userId) });
      return;
    }

    res.status(404).json({ error: "Rota não encontrada." });
  } catch (error) {
    logger.error("Falha ao processar a requisição", error);
    res.status(502).json({ error: "Não foi possível completar a operação agora." });
  }
});
