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

export type QuotesResult = {
  quotes: Quote[];
  failed: string[];
};

export interface MarketDataProvider {
  searchTickers(query: string, limit: number): Promise<TickerSummary[]>;
  getQuotes(symbols: string[]): Promise<QuotesResult>;
}
