import { getQueryParams } from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub",
} as const;

export default function SignIn() {
  const theme = useTheme();
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.centerSection}>
              <Bell size={64} strokeWidth={2} color={theme.text} />
              <ThemedText style={styles.titleText}>Sino</ThemedText>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[styles.outlinedButton, { borderColor: theme.text }]}
                activeOpacity={0.7}
                onPress={() => handleOAuthLogin("google")}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === "google" ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <ThemedText style={styles.buttonText}>
                    Login com Google
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.outlinedButton, { borderColor: theme.text }]}
                activeOpacity={0.7}
                onPress={() => handleOAuthLogin("github")}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === "github" ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <ThemedText style={styles.buttonText}>
                    Login com Github
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cardContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 180,
    paddingVertical: 32,
    gap: 12,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  bottomSection: {
    width: "100%",
    gap: 14,
    paddingBottom: 8,
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
