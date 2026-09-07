import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Bell } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              >
                <ThemedText style={styles.buttonText}>Login com Google</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.outlinedButton, { borderColor: theme.text }]}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.buttonText}>Login com Github</ThemedText>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>
                  ou
                </ThemedText>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.text,
                    backgroundColor: theme.background,
                  },
                ]}
                placeholder="Digite seu email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.primaryButtonText}>Entrar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpContainer}
                activeOpacity={0.6}
              >
                <ThemedText style={styles.signUpText}>Cadastrar-se</ThemedText>
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
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
    paddingVertical: 32,
    gap: 12,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSection: {
    width: '100%',
    gap: 14,
    paddingBottom: 8,
  },
  outlinedButton: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 2,
  },
  dividerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#27374D',
    borderColor: '#27374D',
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signUpContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#526D82',
  },
});
