import { useCallback, useEffect, useState } from "react";

import { getQuotes, type Quote } from "@/services/market";

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbolsKey = symbols.join(",");

  const refresh = useCallback(async () => {
    const requested = symbolsKey ? symbolsKey.split(",") : [];

    if (requested.length === 0) {
      setQuotes({});
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quotes, loading, error, refresh };
}
