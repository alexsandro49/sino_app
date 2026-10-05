import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleUserRound } from "lucide-react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/hooks/use-theme";

export default function User() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const name = user?.name ?? "";
  const email = user?.email ?? "";

  async function handleLogout() {
    await signOut();
    router.replace("/signIn");
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.titleText}>Sua conta</ThemedText>
      </View>

      <View style={styles.profileSection}>
        <CircleUserRound size={64} strokeWidth={1.5} color={theme.text} />
        <ThemedText style={styles.nameText}>{name || "Sem nome cadastrado"}</ThemedText>
        <ThemedText style={[styles.emailText, { color: theme.textSecondary }]}>
          {email}
        </ThemedText>
      </View>

      <View style={styles.actionsSection}>
        <Button variant="outlined" label="Sair" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  profileSection: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 40,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emailText: {
    fontSize: 14,
  },
  actionsSection: {
    gap: 14,
  },
});
