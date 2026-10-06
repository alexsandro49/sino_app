import { FieldValue, getFirestore } from "firebase-admin/firestore";

export const NOTIFICATION_MODES = ["per_ticker", "summary", "none"] as const;

export type NotificationMode = (typeof NOTIFICATION_MODES)[number];

export type UserProfile = {
  notificationMode: NotificationMode;
  pushTokens: string[];
};

const DEFAULT_MODE: NotificationMode = "per_ticker";

function userDoc(userId: string) {
  return getFirestore().collection("users").doc(userId);
}

export function isNotificationMode(value: unknown): value is NotificationMode {
  return typeof value === "string" && (NOTIFICATION_MODES as readonly string[]).includes(value);
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const snapshot = await userDoc(userId).get();
  const mode = snapshot.get("notificationMode");
  const tokens = snapshot.get("pushTokens");

  return {
    notificationMode: isNotificationMode(mode) ? mode : DEFAULT_MODE,
    pushTokens: Array.isArray(tokens) ? tokens.filter((token): token is string => typeof token === "string") : [],
  };
}

export async function setNotificationMode(userId: string, mode: NotificationMode): Promise<void> {
  await userDoc(userId).set({ notificationMode: mode }, { merge: true });
}

export async function addPushToken(userId: string, token: string): Promise<void> {
  await userDoc(userId).set({ pushTokens: FieldValue.arrayUnion(token) }, { merge: true });
}

export async function removePushTokens(userId: string, tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  await userDoc(userId).set({ pushTokens: FieldValue.arrayRemove(...tokens) }, { merge: true });
}
