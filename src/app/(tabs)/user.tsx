import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleUserRound } from "lucide-react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";

export default function User() {
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      setName(data.session.user.user_metadata?.full_name ?? "");
      setEmail(data.session.user.email ?? "");
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
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
        <TouchableOpacity
          style={[styles.outlinedButton, { borderColor: theme.text }]}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <ThemedText style={styles.buttonText}>Sair</ThemedText>
        </TouchableOpacity>
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
  outlinedButton: {
    width: "100%",
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
