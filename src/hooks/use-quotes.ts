import { useCallback, useEffect, useState } from "react";

import { getQuotes, type Quote } from "@/services/market";

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(symbols.length > 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbolsKey = symbols.join(",");

  const load = useCallback(async () => {
    const requested = symbolsKey ? symbolsKey.split(",") : [];

    if (requested.length === 0) {
      setQuotes({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetched = await getQuotes(requested);
      setQuotes(Object.fromEntries(fetched.map((quote) => [quote.symbol, quote])));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar as cotações.");
    } finally {
      setLoading(false);
    }
  }, [symbolsKey]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { quotes, loading, refreshing, error, refresh };
}
