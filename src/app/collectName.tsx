import { useState } from "react";
import { UserRound } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";

export default function CollectName() {
  const theme = useTheme();
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
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
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
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.text,
                    backgroundColor: theme.background,
                  },
                ]}
                placeholder="Seu nome"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                editable={!loading}
                onSubmitEditing={handleSave}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Continuar</ThemedText>
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
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#27374D",
    borderColor: "#27374D",
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
