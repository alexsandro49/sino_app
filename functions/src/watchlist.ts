import { FieldValue, getFirestore } from "firebase-admin/firestore";

export type WatchlistItem = {
  symbol: string;
  name: string;
  logoUrl: string | null;
};

function watchlistCollection(userId: string) {
  return getFirestore().collection("users").doc(userId).collection("watchlist");
}

export async function listWatchlist(userId: string): Promise<WatchlistItem[]> {
  const snapshot = await watchlistCollection(userId).orderBy("createdAt").get();

  return snapshot.docs.map((doc) => ({
    symbol: doc.id,
    name: String(doc.get("name") ?? doc.id),
    logoUrl: typeof doc.get("logoUrl") === "string" ? doc.get("logoUrl") : null,
  }));
}

export async function addToWatchlist(userId: string, items: WatchlistItem[]): Promise<void> {
  const collection = watchlistCollection(userId);
  const batch = getFirestore().batch();

  for (const item of items) {
    batch.set(
      collection.doc(item.symbol),
      { name: item.name, logoUrl: item.logoUrl, createdAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  await batch.commit();
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  await watchlistCollection(userId).doc(symbol).delete();
}
