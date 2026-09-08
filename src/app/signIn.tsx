import { FontAwesome } from "@expo/vector-icons";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { SinoIcon } from "@/components/sino-icon";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub",
} as const;

// Tokens do design system do Sino (paleta própria da marca, não o tema claro/escuro genérico do app).
const SINO_PRIMARY = "#2563E8";
const SINO_INK = "#232A38";
const SINO_BORDER = "#B9C2D2";
const SINO_WHITE = "#FFFFFF";

export default function SignIn() {
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  async function handleOAuthLogin(provider: "google" | "github") {
    const providerLabel = PROVIDER_LABELS[provider];
    setOauthLoading(provider);
    try {
      const redirectTo = Linking.createURL("/");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error || !data?.url) {
        Alert.alert(`Erro ao entrar com ${providerLabel}`, error?.message ?? "Tente novamente.");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== "success") {
        return;
      }

      const { params, errorCode } = getQueryParams(result.url);

      if (errorCode) {
        Alert.alert(`Erro ao entrar com ${providerLabel}`, errorCode);
        return;
      }

      const { access_token, refresh_token } = params;

      if (!access_token || !refresh_token) {
        Alert.alert(`Erro ao entrar com ${providerLabel}`, `Resposta inválida do ${providerLabel}.`);
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        Alert.alert(`Erro ao entrar com ${providerLabel}`, sessionError.message);
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
    <SafeAreaView style={[styles.container, { backgroundColor: SINO_WHITE }]}>
      <View style={styles.centeredGroup}>
        <View style={styles.centerSection}>
          <SinoIcon size={64} />
          <ThemedText style={[styles.titleText, { color: SINO_INK }]}>Sino</ThemedText>
        </View>

        <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.pillButton, { backgroundColor: SINO_WHITE, borderColor: SINO_BORDER }]}
          activeOpacity={0.7}
          onPress={() => handleOAuthLogin("google")}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "google" ? (
            <ActivityIndicator color={SINO_INK} />
          ) : (
            <>
              <FontAwesome name="google" size={18} color={SINO_PRIMARY} />
              <ThemedText style={[styles.buttonText, { color: SINO_INK }]}>
                Continuar com Google
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillButton, { backgroundColor: SINO_WHITE, borderColor: SINO_BORDER }]}
          activeOpacity={0.7}
          onPress={() => handleOAuthLogin("github")}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "github" ? (
            <ActivityIndicator color={SINO_INK} />
          ) : (
            <>
              <FontAwesome name="github" size={18} color={SINO_INK} />
              <ThemedText style={[styles.buttonText, { color: SINO_INK }]}>
                Continuar com GitHub
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
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
  pillButton: {
    flexDirection: "row",
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
