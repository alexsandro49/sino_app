import { onRequest } from "firebase-functions/https";

import { authenticated, notFound, routePath } from "../http.js";
import { marketData, marketDataSecrets } from "../market/index.js";
import { MAX_SYMBOLS, SYMBOL_PATTERN } from "../validation.js";

const MAX_QUERY_LENGTH = 30;
const SEARCH_LIMIT = 15;

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

export const market = onRequest(
  { secrets: marketDataSecrets, cors: true },
  authenticated(async (req, res) => {
    const path = routePath(req);

    if (req.method === "GET" && path === "/tickers") {
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

      if (!query) {
        res.json({ tickers: [] });
        return;
      }

      const tickers = await marketData().searchTickers(query.slice(0, MAX_QUERY_LENGTH), SEARCH_LIMIT);
      res.json({ tickers });
      return;
    }

    if (req.method === "GET" && path === "/quotes") {
      res.json(await marketData().getQuotes(parseSymbols(req.query.symbols)));
      return;
    }

    notFound(res);
  }),
);
