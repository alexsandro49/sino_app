import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Ticker } from "@/services/market";

function storageKey(userId: string) {
  return `sino:watchlist:${userId}`;
}

export async function loadWatchlist(userId: string): Promise<Ticker[]> {
  const stored = await AsyncStorage.getItem(storageKey(userId));
  return stored ? (JSON.parse(stored) as Ticker[]) : [];
}

export async function saveWatchlist(userId: string, tickers: Ticker[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(tickers));
}
