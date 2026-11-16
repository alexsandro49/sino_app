import { Timestamp, getFirestore, type DocumentSnapshot } from "firebase-admin/firestore";

export const ALERT_DIRECTIONS = ["above", "below"] as const;

export type AlertDirection = (typeof ALERT_DIRECTIONS)[number];

export type PriceAlert = {
  id: string;
  symbol: string;
  direction: AlertDirection;
  targetPrice: number;
  createdAt: string;
  triggeredAt: string | null;
  triggeredPrice: number | null;
};

export type OwnedPriceAlert = PriceAlert & { userId: string };

export type NewPriceAlert = Pick<PriceAlert, "symbol" | "direction" | "targetPrice">;

function alertsCollection() {
  return getFirestore().collection("priceAlerts");
}

function isoOf(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function toOwnedAlert(doc: DocumentSnapshot): OwnedPriceAlert {
  const triggeredPrice = doc.get("triggeredPrice");

  return {
    id: doc.id,
    userId: String(doc.get("userId")),
    symbol: String(doc.get("symbol")),
    direction: doc.get("direction") === "below" ? "below" : "above",
    targetPrice: Number(doc.get("targetPrice")),
    createdAt: isoOf(doc.get("createdAt")) ?? new Date(0).toISOString(),
    triggeredAt: isoOf(doc.get("triggeredAt")),
    triggeredPrice: typeof triggeredPrice === "number" ? triggeredPrice : null,
  };
}

function withoutOwner({ userId: _userId, ...alert }: OwnedPriceAlert): PriceAlert {
  return alert;
}

export function isAlertDirection(value: unknown): value is AlertDirection {
  return typeof value === "string" && (ALERT_DIRECTIONS as readonly string[]).includes(value);
}

export async function listAlerts(userId: string): Promise<PriceAlert[]> {
  const snapshot = await alertsCollection().where("userId", "==", userId).get();

  return snapshot.docs
    .map(toOwnedAlert)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(withoutOwner);
}

export async function listPendingAlerts(): Promise<OwnedPriceAlert[]> {
  const snapshot = await alertsCollection().where("triggeredAt", "==", null).get();
  return snapshot.docs.map(toOwnedAlert);
}

export async function createAlert(userId: string, alert: NewPriceAlert): Promise<OwnedPriceAlert> {
  const createdAt = Timestamp.now();
  const ref = await alertsCollection().add({
    userId,
    ...alert,
    createdAt,
    triggeredAt: null,
    triggeredPrice: null,
  });

  return {
    id: ref.id,
    userId,
    ...alert,
    createdAt: createdAt.toDate().toISOString(),
    triggeredAt: null,
    triggeredPrice: null,
  };
}

export async function markAlertTriggered(alertId: string, price: number): Promise<void> {
  await alertsCollection().doc(alertId).update({ triggeredAt: Timestamp.now(), triggeredPrice: price });
}

export async function deleteAlert(userId: string, alertId: string): Promise<boolean> {
  const ref = alertsCollection().doc(alertId);
  const snapshot = await ref.get();

  if (!snapshot.exists || snapshot.get("userId") !== userId) {
    return false;
  }

  await ref.delete();
  return true;
}
