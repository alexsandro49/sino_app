import { apiGet } from "@/services/api";

export type Ticker = {
  symbol: string;
  name: string;
};

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  previousClose: number | null;
  updatedAt: string;
};

export async function searchTickers(query: string): Promise<Ticker[]> {
  const { tickers } = await apiGet<{ tickers: Ticker[] }>("/tickers", { q: query });
  return tickers;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) {
    return [];
  }

  const { quotes } = await apiGet<{ quotes: Quote[] }>("/quotes", { symbols: symbols.join(",") });
  return quotes;
}

export function isMarketOpen(now: Date = new Date()): boolean {
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const weekday = brasiliaTime.getUTCDay();
  const minutes = brasiliaTime.getUTCHours() * 60 + brasiliaTime.getUTCMinutes();

  return weekday >= 1 && weekday <= 5 && minutes >= 10 * 60 && minutes < 18 * 60;
}
