import { useEffect, useState } from "react";

import { searchTickers, type Ticker } from "@/services/market";

const DEBOUNCE_MS = 300;

export function useTickerSearch(query: string) {
  const [results, setResults] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const tickers = await searchTickers(trimmedQuery);
        if (!cancelled) {
          setResults(tickers);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível buscar.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return { results, loading, error };
}
