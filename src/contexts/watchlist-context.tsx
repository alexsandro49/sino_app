import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";
import type { Ticker } from "@/services/market";
import { addToWatchlist, fetchWatchlist, removeFromWatchlist } from "@/services/watchlist";

type WatchlistContextValue = {
  tickers: Ticker[];
  loading: boolean;
  error: string | null;
  isFollowing: (symbol: string) => boolean;
  follow: (ticker: Ticker) => Promise<void>;
  unfollow: (symbol: string) => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTickers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchWatchlist()
      .then((stored) => {
        if (!cancelled) {
          setTickers(stored);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(messageOf(err, "Não foi possível carregar sua carteira."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function follow(ticker: Ticker) {
    if (tickers.some((existing) => existing.symbol === ticker.symbol)) return;

    const previous = tickers;
    setTickers([...tickers, ticker]);
    try {
      setTickers(await addToWatchlist(ticker));
      setError(null);
    } catch (err) {
      setTickers(previous);
      setError(messageOf(err, "Não foi possível adicionar o ticker."));
      throw err;
    }
  }

  async function unfollow(symbol: string) {
    const previous = tickers;
    setTickers(tickers.filter((ticker) => ticker.symbol !== symbol));
    try {
      setTickers(await removeFromWatchlist(symbol));
      setError(null);
    } catch (err) {
      setTickers(previous);
      setError(messageOf(err, "Não foi possível remover o ticker."));
    }
  }

  const value: WatchlistContextValue = {
    tickers,
    loading,
    error,
    isFollowing: (symbol) => tickers.some((ticker) => ticker.symbol === symbol),
    follow,
    unfollow,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
