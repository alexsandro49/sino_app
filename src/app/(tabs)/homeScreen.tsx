import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MarketStatusBadge } from "@/components/market-status-badge";
import { ThemedText } from "@/components/themed-text";
import { TickerRow } from "@/components/ticker-row";
import { Button } from "@/components/ui/button";
import { SinoBrand } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useQuotes } from "@/hooks/use-quotes";
import type { Ticker } from "@/services/market";
import { isMarketOpen } from "@/services/market";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tickers, loading: watchlistLoading, error: watchlistError, unfollow } = useWatchlist();
  const { quotes, loading: quotesLoading, error, refresh } = useQuotes(
    tickers.map((ticker) => ticker.symbol),
  );

  const marketOpen = isMarketOpen();
  const firstName = user?.name?.split(" ")[0];

  function openAddTicker() {
    router.push("/addTicker");
  }

  function confirmUnfollow(ticker: Ticker) {
    Alert.alert(`Deixar de seguir ${ticker.symbol}?`, "Você para de receber a variação dele.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Deixar de seguir", style: "destructive", onPress: () => unfollow(ticker.symbol) },
    ]);
  }

  const isEmpty = !watchlistLoading && tickers.length === 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.greetingText}>{firstName ? `Olá, ${firstName}` : "Olá"}</ThemedText>
        {!isEmpty && <MarketStatusBadge open={marketOpen} />}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTitle}>Nenhum ticket ainda</ThemedText>
          <ThemedText style={styles.emptyMessage}>
            Adicione as ações que você quer acompanhar. No fim do pregão o Sino te avisa.
          </ThemedText>
          <Button label="+ Cadastrar o primeiro" style={styles.emptyButton} onPress={openAddTicker} />
        </View>
      ) : (
        <FlatList
          data={tickers}
          keyExtractor={(ticker) => ticker.symbol}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={quotesLoading} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <TickerRow ticker={item} quote={quotes[item.symbol]} onLongPress={() => confirmUnfollow(item)} />
          )}
          ListFooterComponent={
            <ThemedText style={styles.footnote}>
              {watchlistError ?? error
                ? watchlistError ?? error
                : marketOpen
                  ? "Variação desde o fechamento anterior. O pregão fecha às 18:00. Puxe pra atualizar."
                  : "Variação final do último pregão em relação ao fechamento anterior."}
            </ThemedText>
          }
        />
      )}

      {!isEmpty && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={openAddTicker}
          accessibilityLabel="Cadastrar ticket"
          accessibilityRole="button"
        >
          <Plus size={25} color={SinoBrand.white} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SinoBrand.background,
  },
  header: {
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 14,
    gap: 8,
  },
  greetingText: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.75,
    color: SinoBrand.ink,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 8,
  },
  footnote: {
    marginTop: 6,
    paddingHorizontal: 8,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "400",
    color: SinoBrand.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 42,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "600",
    color: SinoBrand.ink,
  },
  emptyMessage: {
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "400",
    textAlign: "center",
    color: SinoBrand.textSecondary,
  },
  emptyButton: {
    width: "auto",
    height: 46,
    marginTop: 10,
    paddingHorizontal: 18,
  },
  fabButton: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: SinoBrand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
