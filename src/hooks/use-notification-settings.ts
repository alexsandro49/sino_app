import { useEffect, useState } from "react";

import {
  getNotificationMode,
  getPushPermission,
  registerDevice,
  updateNotificationMode,
  type NotificationMode,
  type PushPermission,
} from "@/services/notifications";

export function useNotificationSettings() {
  const [mode, setMode] = useState<NotificationMode | null>(null);
  const [permission, setPermission] = useState<PushPermission>("undetermined");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getNotificationMode(), getPushPermission()])
      .then(([storedMode, currentPermission]) => {
        if (cancelled) return;
        setMode(storedMode);
        setPermission(currentPermission);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Não foi possível carregar suas preferências.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function changeMode(nextMode: NotificationMode) {
    if (nextMode === mode) return;

    const previous = mode;
    setMode(nextMode);
    setSaving(true);
    try {
      await updateNotificationMode(nextMode);
      setError(null);
    } catch (err) {
      setMode(previous);
      setError(err instanceof Error ? err.message : "Não foi possível salvar sua escolha.");
      setSaving(false);
      return;
    }

    if (nextMode !== "none") {
      try {
        setPermission(await registerDevice({ askPermission: true }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível ativar as notificações neste aparelho.");
      }
    }
    setSaving(false);
  }

  async function enableOnDevice() {
    setSaving(true);
    try {
      setPermission(await registerDevice({ askPermission: true }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ativar as notificações.");
    } finally {
      setSaving(false);
    }
  }

  return { mode, permission, saving, error, changeMode, enableOnDevice };
}
