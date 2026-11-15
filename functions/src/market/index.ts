import { defineSecret } from "firebase-functions/params";

import { createBrapiProvider } from "./brapi-provider.js";
import type { MarketDataProvider } from "./provider.js";

const brapiToken = defineSecret("BRAPI_TOKEN");

export const marketDataSecrets = [brapiToken];

export function marketData(): MarketDataProvider {
  return createBrapiProvider(brapiToken.value());
}

export type { MarketDataProvider, Quote, QuotesResult, TickerSummary } from "./provider.js";
