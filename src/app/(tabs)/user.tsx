import Constants from "expo-constants";
import { LogOut } from "lucide-react-native";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useWatchlist } from "@/contexts/watchlist-context";

export default function User() {
  const { user, signOut } = useAuth();
  const { tickers } = useWatchlist();

  const name = user?.name ?? "Sem nome";
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const following =
    tickers.length === 0
      ? "Nenhum ticker na carteira"
      : tickers.length === 1
        ? "1 ticker na carteira"
        : `${tickers.length} tickers na carteira`;

  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Sua carteira fica salva e volta quando você entrar de novo.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">Perfil</Text>
      </View>

      <View style={styles.content}>
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
        </View>

        <View style={styles.infoRow}>
          <Text variant="label" tone="secondary" style={styles.infoLabel}>
            Carteira
          </Text>
          <Text variant="label" style={styles.infoValue}>
            {following}
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            variant="ghost"
            size="compact"
            label="Sair da conta"
            icon={<LogOut size={16} strokeWidth={1.7} color={SinoBrand.textSecondary} />}
            onPress={confirmSignOut}
          />
          <Text variant="caption" tone="tertiary" style={styles.version}>
            Sino {Constants.expoConfig?.version ?? ""}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SinoBrand.background,
  },
  header: {
    paddingTop: 22,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: SinoBrand.cardBorder,
    backgroundColor: SinoBrand.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: SinoRadius.control,
    backgroundColor: SinoBrand.primarySoft,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.control,
    backgroundColor: SinoBrand.neutralMuted,
  },
  infoLabel: {
    flex: 1,
    fontFamily: SinoFonts.regular,
  },
  infoValue: {
    fontFamily: SinoFonts.semibold,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 16,
    alignItems: "center",
    gap: 4,
  },
  version: {
    textAlign: "center",
  },
});
