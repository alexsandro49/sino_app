import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";
import type { Ticker } from "@/services/market";
import { loadWatchlist, saveWatchlist } from "@/services/watchlist";

type WatchlistContextValue = {
  tickers: Ticker[];
  loading: boolean;
  isFollowing: (symbol: string) => boolean;
  follow: (ticker: Ticker) => Promise<void>;
  unfollow: (symbol: string) => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTickers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    loadWatchlist(userId)
      .then((stored) => {
        if (!cancelled) setTickers(stored);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function persist(next: Ticker[]) {
    setTickers(next);
    if (userId) {
      await saveWatchlist(userId, next);
    }
  }

  const value: WatchlistContextValue = {
    tickers,
    loading,
    isFollowing: (symbol) => tickers.some((ticker) => ticker.symbol === symbol),
    follow: async (ticker) => {
      if (tickers.some((existing) => existing.symbol === ticker.symbol)) return;
      await persist([...tickers, ticker]);
    },
    unfollow: async (symbol) => {
      await persist(tickers.filter((ticker) => ticker.symbol !== symbol));
    },
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
