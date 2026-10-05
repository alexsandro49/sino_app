import { FontAwesome } from "@expo/vector-icons";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/themed-text";
import { SinoBrand } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert("Erro ao entrar com Google", error);
      }
    } catch (err) {
      Alert.alert(
        "Erro inesperado",
        err instanceof Error ? err.message : "Não foi possível entrar com Google.",
      );
    } finally {
      setLoading(false);
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
            onPress={handleGoogleLogin}
            loading={loading}
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
