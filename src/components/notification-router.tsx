import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/contexts/auth-context";
import { getNotificationMode, registerDevice, targetOf } from "@/services/notifications";

export function NotificationRouter() {
  const router = useRouter();
  const { user, loading, isProfileComplete } = useAuth();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledResponseId = useRef<string | null>(null);
  const ready = !loading && Boolean(user) && isProfileComplete;

  useEffect(() => {
    if (!ready) return;

    getNotificationMode()
      .then((mode) => (mode === "none" ? null : registerDevice({ askPermission: false })))
      .catch(() => null);
  }, [ready, user?.id]);

  useEffect(() => {
    if (!ready || !lastResponse) return;

    const responseId = lastResponse.notification.request.identifier;
    if (handledResponseId.current === responseId) return;
    handledResponseId.current = responseId;

    const target = targetOf(lastResponse);
    if (!target) return;

    if (target.screen === "ticker") {
      router.push({ pathname: "/ticker/[symbol]", params: { symbol: target.symbol } });
    } else {
      router.navigate("/homeScreen");
    }
  }, [ready, lastResponse, router]);

  return null;
}
