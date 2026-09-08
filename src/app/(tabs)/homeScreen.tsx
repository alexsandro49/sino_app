import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/signIn');
    }
  }, [loading, session, router]);

  const userName = session?.user.user_metadata?.full_name ?? '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.greetingText}>
          {userName ? `Olá, ${userName}` : 'Olá'}
        </ThemedText>
      </View>

      <View style={styles.centerContainer}>
        <ThemedText style={styles.emptyMessageText}>
          Você não está{'\n'}rastreando nenhum ticket
        </ThemedText>

        <Button label="+ Cadastrar o primeiro" style={styles.primaryActionButton} />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.7}
          accessibilityLabel="Cadastrar ticket"
          accessibilityRole="button"
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyMessageText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryActionButton: {
    width: 'auto',
    paddingHorizontal: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 28,
  },
  fabButton: {
    width: 52,
    height: 52,
    backgroundColor: '#27374D',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
