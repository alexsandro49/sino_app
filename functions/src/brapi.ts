const BRAPI_URL = "https://brapi.dev/api/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const FRACTIONAL_SYMBOL = /^[A-Z]{4}\d{1,2}F$/;

export type TickerSummary = {
  symbol: string;
  name: string;
  logoUrl: string | null;
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

type BrapiTickersResponse = {
  results?: {
    symbol: string;
    name?: string;
    longName?: string;
    isActive?: boolean;
    logoUrl?: string;
  }[];
};

type BrapiQuoteResponse = {
  results?: {
    symbol: string;
    data?: {
      shortName?: string;
      longName?: string;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
      regularMarketPreviousClose?: number;
      regularMarketOpen?: number;
      regularMarketDayLow?: number;
      regularMarketDayHigh?: number;
      regularMarketVolume?: number;
      marketCap?: number;
      fiftyTwoWeekLow?: number;
      fiftyTwoWeekHigh?: number;
      regularMarketTime?: string;
      logourl?: string;
    };
  }[];
};

const quoteCache = new Map<string, { quote: Quote; expiresAt: number }>();

async function brapiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${BRAPI_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`brapi respondeu ${response.status} para ${path}`);
  }

  return (await response.json()) as T;
}

export async function searchTickers(query: string, limit: number): Promise<TickerSummary[]> {
  const params = `search=${encodeURIComponent(query)}&limit=${limit}&sortBy=volume&sortOrder=desc`;
  const body = await brapiGet<BrapiTickersResponse>(`/tickers?${params}`);

  return (body.results ?? [])
    .filter((ticker) => ticker.isActive !== false && !FRACTIONAL_SYMBOL.test(ticker.symbol))
    .map((ticker) => ({
      symbol: ticker.symbol,
      name: ticker.longName ?? ticker.name ?? ticker.symbol,
      logoUrl: ticker.logoUrl ?? null,
    }));
}

async function fetchQuote(symbol: string, token: string): Promise<Quote> {
  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.quote;
  }

  const body = await brapiGet<BrapiQuoteResponse>(
    `/stocks/quote?symbols=${encodeURIComponent(symbol)}`,
    token,
  );
  const data = body.results?.[0]?.data;

  if (data?.regularMarketPrice === undefined || data.regularMarketChangePercent === undefined) {
    throw new Error(`Cotação indisponível para ${symbol}`);
  }

  const quote: Quote = {
    symbol,
    name: data.longName ?? data.shortName ?? symbol,
    logoUrl: data.logourl ?? null,
    price: data.regularMarketPrice,
    changePercent: data.regularMarketChangePercent,
    previousClose: data.regularMarketPreviousClose ?? null,
    open: data.regularMarketOpen ?? null,
    dayLow: data.regularMarketDayLow ?? null,
    dayHigh: data.regularMarketDayHigh ?? null,
    volume: data.regularMarketVolume ?? null,
    marketCap: data.marketCap ?? null,
    fiftyTwoWeekLow: data.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: data.fiftyTwoWeekHigh ?? null,
    updatedAt: data.regularMarketTime ?? new Date().toISOString(),
  };

  quoteCache.set(symbol, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
  return quote;
}

export async function getQuotes(
  symbols: string[],
  token: string,
): Promise<{ quotes: Quote[]; failed: string[] }> {
  const settled = await Promise.allSettled(symbols.map((symbol) => fetchQuote(symbol, token)));

  const quotes: Quote[] = [];
  const failed: string[] = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    } else {
      failed.push(symbols[index]);
    }
  });

  return { quotes, failed };
}
