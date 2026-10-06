import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";

import { useAuth } from "@/contexts/auth-context";
import { themedStyles } from "@/hooks/use-colors";

export default function CollectName() {
  const styles = useStyles();
  const { updateDisplayName, signOut } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Falta o seu nome", "Digite como você quer ser chamado pra continuar.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateDisplayName(trimmedName);
      if (error) {
        Alert.alert("Não deu pra salvar", error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.intro}>
            <Text variant="hero">Como podemos te chamar?</Text>
            <Text variant="body" tone="secondary">
              Usamos só pra te cumprimentar no app.
            </Text>
          </View>

          <View style={styles.field}>
            <Text variant="label" tone="secondary">
              Nome
            </Text>
            <TextField
              placeholder="Seu nome"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              value={name}
              onChangeText={setName}
              editable={!loading}
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />
          </View>

          <View style={styles.actions}>
            <Button label="Continuar" onPress={handleSave} loading={loading} />
            <Button variant="ghost" size="compact" label="Usar outra conta" onPress={signOut} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = themedStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 24,
  },
  intro: {
    gap: 8,
  },
  field: {
    gap: 7,
  },
  actions: {
    marginTop: "auto",
    gap: 6,
  },
}));
