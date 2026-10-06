import { apiDelete, apiGet, apiPost } from "@/services/api";
import type { Ticker } from "@/services/market";

type WatchlistResponse = {
  tickers: Ticker[];
};

export async function fetchWatchlist(): Promise<Ticker[]> {
  const { tickers } = await apiGet<WatchlistResponse>("/watchlist");
  return tickers;
}

export async function addToWatchlist(ticker: Ticker): Promise<Ticker[]> {
  const { tickers } = await apiPost<WatchlistResponse>("/watchlist", ticker);
  return tickers;
}

export async function removeFromWatchlist(symbol: string): Promise<Ticker[]> {
  const { tickers } = await apiDelete<WatchlistResponse>(`/watchlist/${encodeURIComponent(symbol)}`);
  return tickers;
}
