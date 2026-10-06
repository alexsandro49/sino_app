import { apiGet } from "@/services/api";

export type Ticker = {
  symbol: string;
  name: string;
  logoUrl?: string | null;
};

export type Quote = {
  symbol: string;
  name: string;
  logoUrl: string | null;
  price: number;
  changePercent: number;
  previousClose: number | null;
  open: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  volume: number | null;
  marketCap: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  updatedAt: string;
};

export function googleFinanceUrl(symbol: string): string {
  return `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}:BVMF?hl=pt`;
}

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
