import { FieldValue, getFirestore } from "firebase-admin/firestore";

export type WatchlistItem = {
  symbol: string;
  name: string;
};

function watchlistCollection(userId: string) {
  return getFirestore().collection("users").doc(userId).collection("watchlist");
}

export async function listWatchlist(userId: string): Promise<WatchlistItem[]> {
  const snapshot = await watchlistCollection(userId).orderBy("createdAt").get();

  return snapshot.docs.map((doc) => ({
    symbol: doc.id,
    name: String(doc.get("name") ?? doc.id),
  }));
}

export async function addToWatchlist(userId: string, item: WatchlistItem): Promise<void> {
  await watchlistCollection(userId)
    .doc(item.symbol)
    .set({ name: item.name, createdAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  await watchlistCollection(userId).doc(symbol).delete();
}
