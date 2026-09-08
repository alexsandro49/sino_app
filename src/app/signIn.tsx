import { FontAwesome } from "@expo/vector-icons";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { SinoBrand } from "@/constants/theme";
import { signInWithProvider, type OAuthProvider } from "@/lib/oauth";

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  google: "Google",
  github: "GitHub",
};

export default function SignIn() {
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  async function handleOAuthLogin(provider: OAuthProvider) {
    const providerLabel = PROVIDER_LABELS[provider];
    setOauthLoading(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        Alert.alert(`Erro ao entrar com ${providerLabel}`, error);
      }
    } catch (err) {
      Alert.alert(
        "Erro inesperado",
        err instanceof Error ? err.message : `Não foi possível entrar com ${providerLabel}.`,
      );
    } finally {
      setOauthLoading(null);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: SinoBrand.white }]}>
      <View style={styles.centeredGroup}>
        <View style={styles.centerSection}>
          <Bell size={52} strokeWidth={2} color={SinoBrand.primary} />
          <ThemedText style={[styles.titleText, { color: SinoBrand.ink }]}>Sino</ThemedText>
        </View>

        <View style={styles.bottomSection}>
          <Button
            variant="outlined"
            label="Continuar com Google"
            icon={<FontAwesome name="google" size={18} color={SinoBrand.primary} />}
            onPress={() => handleOAuthLogin("google")}
            loading={oauthLoading === "google"}
            disabled={oauthLoading !== null}
          />

          <Button
            variant="outlined"
            label="Continuar com GitHub"
            icon={<FontAwesome name="github" size={18} color={SinoBrand.ink} />}
            onPress={() => handleOAuthLogin("github")}
            loading={oauthLoading === "github"}
            disabled={oauthLoading !== null}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centeredGroup: {
    flex: 1,
    justifyContent: "center",
    gap: 40,
  },
  centerSection: {
    alignItems: "center",
    gap: 10,
  },
  titleText: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  bottomSection: {
    width: "100%",
    gap: 14,
  },
});
