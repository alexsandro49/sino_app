import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { MarketStatusBadge } from "@/components/market-status-badge";
import { SinoMark } from "@/components/sino-mark";
import { SwipeableTickerRow } from "@/components/swipeable-ticker-row";
import { TickerRowSkeleton } from "@/components/ticker-row";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SinoBrand, SinoRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useQuotes } from "@/hooks/use-quotes";
import { isMarketOpen } from "@/services/market";

const todayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Sao_Paulo",
});

function formatToday() {
  const [weekday, ...rest] = todayFormatter.format(new Date()).split(", ");
  const shortWeekday = weekday.replace("-feira", "");
  return [shortWeekday.charAt(0).toUpperCase() + shortWeekday.slice(1), ...rest].join(", ");
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tickers, loading: watchlistLoading, error: watchlistError, unfollow } = useWatchlist();
  const {
    quotes,
    loading: quotesLoading,
    refreshing,
    error: quotesError,
    refresh,
  } = useQuotes(tickers.map((ticker) => ticker.symbol));

  const marketOpen = isMarketOpen();
  const firstName = user?.name?.split(" ")[0];
  const isEmpty = !watchlistLoading && tickers.length === 0;

  function openAddTicker() {
    router.push("/addTicker");
  }

  const openRow = useRef<SwipeableMethods | null>(null);

  function handleRowOpen(methods: SwipeableMethods) {
    if (openRow.current && openRow.current !== methods) {
      openRow.current.close();
    }
    openRow.current = methods;
  }

  function closeOpenRow() {
    openRow.current?.close();
    openRow.current = null;
  }

  const footnote = watchlistError
    ? watchlistError
    : quotesError
      ? quotesError
      : marketOpen
        ? "Variação desde o último fechamento. O pregão fecha às 18:00, puxe a lista pra atualizar."
        : "Números finais do último pregão, comparados ao fechamento anterior.";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">{firstName ? `Olá, ${firstName}` : "Olá"}</Text>
        {isEmpty || watchlistLoading ? (
          <Text variant="body" tone="secondary" style={styles.date}>
            {formatToday()}
          </Text>
        ) : (
          <MarketStatusBadge open={marketOpen} />
        )}
      </View>

      {watchlistLoading ? (
        <View style={styles.list}>
          <TickerRowSkeleton />
          <TickerRowSkeleton />
          <TickerRowSkeleton />
        </View>
      ) : isEmpty ? (
        <View style={styles.empty}>
          <SinoMark size={48} muted />
          <View style={styles.emptyText}>
            <Text variant="heading" style={styles.centered}>
              Nenhum ticket ainda
            </Text>
            <Text variant="body" tone="secondary" style={[styles.centered, styles.emptyMessage]}>
              Adicione as ações que você quer acompanhar. No fim do pregão o Sino te avisa.
            </Text>
          </View>
          <Button
            label="Cadastrar o primeiro"
            size="compact"
            icon={<Plus size={17} strokeWidth={2} color={SinoBrand.white} />}
            onPress={openAddTicker}
          />
          {watchlistError ? (
            <Text variant="caption" tone="down" style={styles.centered}>
              {watchlistError}
            </Text>
          ) : null}
        </View>
      ) : (
        <Animated.FlatList
          data={tickers}
          keyExtractor={(ticker) => ticker.symbol}
          contentContainerStyle={styles.list}
          itemLayoutAnimation={LinearTransition.duration(220)}
          onScrollBeginDrag={closeOpenRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={SinoBrand.textTertiary} />
          }
          renderItem={({ item }) => (
            <Animated.View exiting={FadeOut.duration(160)}>
              <SwipeableTickerRow
                ticker={item}
                quote={quotes[item.symbol]}
                pending={quotesLoading}
                onOpen={handleRowOpen}
                onPress={() => {
                  closeOpenRow();
                  router.push({ pathname: "/ticker/[symbol]", params: { symbol: item.symbol } });
                }}
                onRemove={() => {
                  openRow.current = null;
                  unfollow(item.symbol);
                }}
              />
            </Animated.View>
          )}
          ListFooterComponent={
            <Text
              variant="caption"
              tone={watchlistError || quotesError ? "down" : "tertiary"}
              style={styles.footnote}
            >
              {footnote}
            </Text>
          }
        />
      )}

      {!isEmpty && !watchlistLoading ? (
        <Pressable
          onPress={openAddTicker}
          accessibilityLabel="Adicionar ticket"
          accessibilityRole="button"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Plus size={25} color={SinoBrand.white} strokeWidth={2} />
        </Pressable>
      ) : null}
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
  date: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: -5,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 110,
    gap: 8,
  },
  footnote: {
    marginTop: 6,
    paddingHorizontal: 8,
    lineHeight: 19,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    paddingHorizontal: 42,
    paddingBottom: 40,
  },
  emptyText: {
    gap: 8,
  },
  emptyMessage: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  centered: {
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: SinoRadius.fab,
    backgroundColor: SinoBrand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPressed: {
    backgroundColor: SinoBrand.primaryPressed,
  },
});
