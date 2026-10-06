import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Bell, BellOff, BellRing, List, LogOut, Send, TriangleAlert } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RadioCard } from "@/components/radio-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SinoFonts, SinoRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { sendSummaryNow, unregisterDevice, type NotificationMode, type SummaryResult } from "@/services/notifications";
import { themedStyles, useColors } from "@/hooks/use-colors";

const MODE_OPTIONS = [
  {
    mode: "per_ticker",
    icon: List,
    title: "Uma por ticket",
    description: "Uma notificação para cada ação, com a variação do dia.",
  },
  {
    mode: "summary",
    icon: Bell,
    title: "Minimalista",
    description: "Só um aviso de que o resumo está pronto. Você abre o app pra ver.",
  },
  {
    mode: "none",
    icon: BellOff,
    title: "Nenhuma",
    description: "Desativa as notificações do Sino.",
  },
] as const satisfies readonly { mode: NotificationMode; icon: unknown; title: string; description: string }[];

const SKIPPED_MESSAGES: Record<Extract<SummaryResult, { status: "skipped" }>["reason"], string> = {
  notifications_off: "Suas notificações estão desligadas. Escolha um dos tipos acima.",
  no_device: "Este iPhone ainda não está registrado. Permita as notificações e tente de novo.",
  empty_watchlist: "Sua carteira está vazia. Adicione um ticker antes de testar.",
  no_quotes: "Não conseguimos as cotações agora. Tente de novo em instantes.",
};

export default function User() {
  const colors = useColors();
  const styles = useStyles();
  const { user, signOut } = useAuth();
  const { tickers } = useWatchlist();
  const { mode, permission, saving, error, changeMode, enableOnDevice } = useNotificationSettings();
  const [sending, setSending] = useState(false);

  const name = user?.name ?? "Sem nome";
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const following =
    tickers.length === 0
      ? "Nenhum ticker"
      : tickers.length === 1
        ? "1 ticker"
        : `${tickers.length} tickers`;
  const notificationsOn = mode !== null && mode !== "none";

  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Sua carteira fica salva e volta quando você entrar de novo.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await unregisterDevice().catch(() => null);
          await signOut();
        },
      },
    ]);
  }

  async function handleSendNow() {
    setSending(true);
    try {
      const result = await sendSummaryNow();
      if (result.status === "sent") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Resumo enviado",
          result.notifications === 1
            ? "Sua notificação chega em instantes."
            : `${result.notifications} notificações chegam em instantes.`,
        );
      } else {
        Alert.alert("Não deu pra enviar", SKIPPED_MESSAGES[result.reason]);
      }
    } catch (err) {
      Alert.alert("Não deu pra enviar", err instanceof Error ? err.message : "Tente de novo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="title" style={styles.title}>
          Perfil
        </Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text tone="primary" style={styles.avatarText}>
              {initial}
            </Text>
          </View>
          <View style={styles.identity}>
            <Text variant="ticker" numberOfLines={1}>
              {name}
            </Text>
            {user?.email ? (
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" tone="tertiary">
            {following}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="overline" tone="tertiary" style={styles.sectionLabel}>
            Notificações
          </Text>

          {MODE_OPTIONS.map((option) => (
            <RadioCard
              key={option.mode}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={mode === option.mode}
              disabled={mode === null || saving}
              onPress={() => changeMode(option.mode)}
            />
          ))}

          {notificationsOn && permission === "undetermined" ? (
            <Pressable
              onPress={enableOnDevice}
              disabled={saving}
              accessibilityRole="button"
              style={({ pressed }) => [styles.notice, styles.noticeAction, pressed && styles.noticePressed]}
            >
              <BellRing size={17} strokeWidth={1.8} color={colors.primaryText} />
              <Text variant="label" tone="primary" style={styles.noticeText}>
                Permitir notificações neste iPhone
              </Text>
            </Pressable>
          ) : null}

          {notificationsOn && permission === "denied" ? (
            <Pressable
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              style={({ pressed }) => [styles.notice, styles.noticeWarning, pressed && styles.noticePressed]}
            >
              <TriangleAlert size={17} strokeWidth={1.8} color={colors.down} />
              <Text variant="label" tone="down" style={styles.noticeText}>
                As notificações estão bloqueadas no iPhone. Toque pra abrir os Ajustes.
              </Text>
            </Pressable>
          ) : null}

          {notificationsOn && permission === "unsupported" ? (
            <View style={styles.notice}>
              <Text variant="label" tone="secondary" style={styles.noticeText}>
                Notificações só chegam num celular de verdade, não no simulador ou no navegador.
              </Text>
            </View>
          ) : null}

          {error ? (
            <Text variant="caption" tone="down" style={styles.sectionLabel}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text variant="overline" tone="tertiary" style={styles.sectionLabel}>
            Testar agora
          </Text>
          <Button
            variant="secondary"
            label="Enviar resumo agora"
            icon={<Send size={16} strokeWidth={1.8} color={colors.ink} />}
            loading={sending}
            disabled={!notificationsOn}
            onPress={handleSendNow}
          />
          <Text variant="caption" tone="tertiary" style={styles.sectionLabel}>
            Manda já o aviso que você recebe no fim do pregão, com as cotações de agora.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            variant="ghost"
            size="compact"
            label="Sair da conta"
            icon={<LogOut size={16} strokeWidth={1.7} color={colors.textSecondary} />}
            onPress={confirmSignOut}
          />
          <Text variant="caption" tone="tertiary" style={styles.version}>
            Sino {Constants.expoConfig?.version ?? ""}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = themedStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 20,
  },
  title: {
    paddingHorizontal: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    backgroundColor: c.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: SinoRadius.control,
    backgroundColor: c.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: SinoFonts.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    paddingHorizontal: 6,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.control,
    backgroundColor: c.neutralMuted,
  },
  noticeAction: {
    backgroundColor: c.primaryTint,
  },
  noticeWarning: {
    backgroundColor: c.downSoft,
  },
  noticePressed: {
    opacity: 0.8,
  },
  noticeText: {
    flex: 1,
    fontFamily: SinoFonts.regular,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    gap: 4,
  },
  version: {
    textAlign: "center",
  },
}));
