import { useState } from "react";
import { UserRound } from "lucide-react-native";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/hooks/use-theme";

export default function CollectName() {
  const theme = useTheme();
  const { updateDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Nome obrigatório", "Digite seu nome para continuar.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateDisplayName(trimmedName);

      if (error) {
        Alert.alert("Erro ao salvar", error);
      }
    } catch (err) {
      Alert.alert(
        "Erro inesperado",
        err instanceof Error ? err.message : "Não foi possível salvar o nome.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
              <UserRound size={64} strokeWidth={2} color={theme.text} />
              <ThemedText style={styles.titleText}>Como podemos te chamar?</ThemedText>
              <ThemedText style={[styles.subtitleText, { color: theme.textSecondary }]}>
                Só usamos isso pra personalizar sua experiência no Sino.
              </ThemedText>
            </View>

            <View style={styles.bottomSection}>
              <TextField
                placeholder="Seu nome"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                editable={!loading}
                onSubmitEditing={handleSave}
                returnKeyType="done"
              />

              <Button label="Continuar" onPress={handleSave} loading={loading} />
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
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSection: {
    width: "100%",
    gap: 14,
    paddingBottom: 8,
  },
});
