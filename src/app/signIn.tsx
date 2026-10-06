import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SinoMark } from "@/components/sino-mark";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useAuth } from "@/contexts/auth-context";
import { themedStyles, useColors } from "@/hooks/use-colors";

export default function SignIn() {
  const colors = useColors();
  const styles = useStyles();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert("Não deu pra entrar com o Google", error);
      }
    } catch (err) {
      Alert.alert(
        "Não deu pra entrar com o Google",
        err instanceof Error ? err.message : "Tente de novo em instantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brand}>
        <SinoMark size={58} />
        <Text variant="display" style={styles.wordmark}>
          Sino
        </Text>
        <Text variant="body" tone="secondary" style={styles.tagline}>
          Suas ações favoritas, resumidas quando o pregão fecha.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          variant="secondary"
          label="Continuar com Google"
          icon={<FontAwesome name="google" size={17} color={colors.primaryText} />}
          onPress={handleGoogleLogin}
          loading={loading}
        />
        <Text variant="caption" tone="tertiary" style={styles.footnote}>
          Sem senha. Você entra com a sua conta Google.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const useStyles = themedStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  brand: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 34,
  },
  wordmark: {
    marginTop: 6,
  },
  tagline: {
    textAlign: "center",
    maxWidth: 248,
  },
  actions: {
    paddingHorizontal: 26,
    paddingBottom: 24,
    gap: 14,
  },
  footnote: {
    textAlign: "center",
  },
}));
