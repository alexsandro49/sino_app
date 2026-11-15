import { onRequest } from "firebase-functions/https";

import { authenticated, notFound, routePath } from "../http.js";
import { MAX_SYMBOLS, SYMBOL_PATTERN } from "../validation.js";
import { addToWatchlist, listWatchlist, removeFromWatchlist, type WatchlistItem } from "../watchlist.js";

const MAX_NAME_LENGTH = 120;
const ITEM_PATH = /^\/([A-Za-z0-9]+)$/;
const LOGO_URL_PATTERN = /^https:\/\/icons\.brapi\.dev\/icons\/[A-Za-z0-9]+\.svg$/;

function parseWatchlistItems(raw: unknown): WatchlistItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SYMBOLS) {
    return null;
  }

  const items: WatchlistItem[] = [];

  for (const entry of raw) {
    const symbol = typeof entry?.symbol === "string" ? entry.symbol.trim().toUpperCase() : "";
    const name = typeof entry?.name === "string" ? entry.name.trim().slice(0, MAX_NAME_LENGTH) : "";

    if (!SYMBOL_PATTERN.test(symbol)) {
      return null;
    }

    const logoUrl = typeof entry?.logoUrl === "string" && LOGO_URL_PATTERN.test(entry.logoUrl) ? entry.logoUrl : null;

    items.push({ symbol, name: name || symbol, logoUrl });
  }

  return items;
}

export const watchlist = onRequest(
  { cors: true },
  authenticated(async (req, res, userId) => {
    const path = routePath(req);

    if (req.method === "GET" && path === "/") {
      res.json({ tickers: await listWatchlist(userId) });
      return;
    }

    if (req.method === "POST" && path === "/") {
      const items = parseWatchlistItems(req.body?.tickers);

      if (!items) {
        res.status(400).json({ error: "Lista de tickers inválida." });
        return;
      }

      await addToWatchlist(userId, items);
      res.status(201).json({ tickers: await listWatchlist(userId) });
      return;
    }

    const itemMatch = ITEM_PATH.exec(path);
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

    notFound(res);
  }),
);
