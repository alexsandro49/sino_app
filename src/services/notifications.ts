import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";

export type NotificationMode = "per_ticker" | "summary" | "none";

export type PushPermission = "granted" | "denied" | "undetermined" | "unsupported";

export type SummaryResult =
  | { status: "sent"; notifications: number }
  | { status: "skipped"; reason: "notifications_off" | "no_device" | "empty_watchlist" | "no_quotes" };

export type NotificationTarget = { screen: "ticker"; symbol: string } | { screen: "home" };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let registeredToken: string | null = null;

export async function getPushPermission(): Promise<PushPermission> {
  if (!Device.isDevice || Platform.OS === "web") {
    return "unsupported";
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function registerDevice({ askPermission }: { askPermission: boolean }): Promise<PushPermission> {
  let permission = await getPushPermission();

  if (permission === "unsupported") {
    return permission;
  }

  if (permission !== "granted" && askPermission) {
    const { status } = await Notifications.requestPermissionsAsync();
    permission = status;
  }

  if (permission !== "granted") {
    return permission;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Avisos do pregão",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  await apiPost("/me/push-tokens", { token });
  registeredToken = token;
  return permission;
}

export async function unregisterDevice(): Promise<void> {
  if (!registeredToken) return;

  try {
    await apiDelete("/me/push-tokens", { token: registeredToken });
  } finally {
    registeredToken = null;
  }
}

export async function getNotificationMode(): Promise<NotificationMode> {
  const { notificationMode } = await apiGet<{ notificationMode: NotificationMode }>("/me/preferences");
  return notificationMode;
}

export async function updateNotificationMode(mode: NotificationMode): Promise<NotificationMode> {
  const { notificationMode } = await apiPut<{ notificationMode: NotificationMode }>("/me/preferences", {
    notificationMode: mode,
  });
  return notificationMode;
}

export function sendSummaryNow(): Promise<SummaryResult> {
  return apiPost<SummaryResult>("/me/summary", {});
}

export function targetOf(response: Notifications.NotificationResponse): NotificationTarget | null {
  const data = response.notification.request.content.data;

  if (data?.screen === "ticker" && typeof data.symbol === "string") {
    return { screen: "ticker", symbol: data.symbol };
  }

  if (data?.screen === "home") {
    return { screen: "home" };
  }

  return null;
}
