import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink, X } from "lucide-react-native";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TickerLogo } from "@/components/ticker-logo";
import { ChangePill } from "@/components/ticker-row";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SinoFonts, SinoRadius } from "@/constants/theme";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useQuotes } from "@/hooks/use-quotes";
import { googleFinanceUrl, type Quote } from "@/services/market";
import { formatCompact, formatPrice, formatUpdatedAt } from "@/utils/format";
import { themedStyles, useColors } from "@/hooks/use-colors";

function DayRange({ quote }: { quote: Quote }) {
  const styles = useStyles();
  if (quote.dayLow === null || quote.dayHigh === null || quote.dayHigh <= quote.dayLow) {
    return null;
  }

  const position = Math.min(1, Math.max(0, (quote.price - quote.dayLow) / (quote.dayHigh - quote.dayLow)));

  return (
    <View style={styles.section}>
      <Text variant="overline" tone="tertiary">
        Faixa do dia
      </Text>
      <View style={styles.rangeTrack}>
        <View style={[styles.rangeFill, { width: `${position * 100}%` }]} />
        <View style={[styles.rangeMarker, { left: `${position * 100}%` }]} />
      </View>
      <View style={styles.rangeLabels}>
        <Text variant="caption" tone="secondary">
          Mín {formatPrice(quote.dayLow)}
        </Text>
        <Text variant="caption" tone="secondary">
          Máx {formatPrice(quote.dayHigh)}
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  const styles = useStyles();
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="ticker" style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

function DetailSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.skeletonGroup}>
      <View style={[styles.skeleton, { width: 150, height: 30 }]} />
      <View style={[styles.skeleton, { width: 110, height: 22 }]} />
      <View style={[styles.skeleton, { width: "100%", height: 46, marginTop: 18 }]} />
      <View style={styles.stats}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.stat, styles.skeleton, { height: 62 }]} />
        ))}
      </View>
    </View>
  );
}

export default function TickerDetail() {
  const colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const { symbol: rawSymbol } = useLocalSearchParams<{ symbol: string }>();
  const symbol = String(rawSymbol ?? "").toUpperCase();
  const { tickers, isFollowing, unfollow } = useWatchlist();
  const { quotes, loading, error, refresh } = useQuotes([symbol]);

  const quote = quotes[symbol];
  const name = quote?.name ?? tickers.find((ticker) => ticker.symbol === symbol)?.name ?? "";

  function openGoogleFinance() {
    WebBrowser.openBrowserAsync(googleFinanceUrl(symbol), {
      controlsColor: colors.primaryText,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }

  function confirmUnfollow() {
    Alert.alert(`Deixar de seguir ${symbol}?`, "Ele sai da sua carteira e dos avisos do fim do pregão.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deixar de seguir",
        style: "destructive",
        onPress: async () => {
          await unfollow(symbol);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.header}>
        <TickerLogo
          symbol={symbol}
          logoUrl={quote?.logoUrl ?? tickers.find((ticker) => ticker.symbol === symbol)?.logoUrl}
          size={46}
        />
        <View style={styles.identity}>
          <Text variant="title">{symbol}</Text>
          {name ? (
            <Text variant="caption" tone="secondary" numberOfLines={2}>
              {name}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <X size={15} strokeWidth={1.9} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {quote ? (
          <>
            <View style={styles.priceBlock}>
              <Text variant="hero" style={styles.price}>
                {formatPrice(quote.price)}
              </Text>
              <View style={styles.changeRow}>
                <ChangePill changePercent={quote.changePercent} />
                <Text variant="caption" tone="tertiary">
                  no dia
                </Text>
              </View>
            </View>

            <DayRange quote={quote} />

            <View style={styles.stats}>
              {quote.open !== null ? <Stat label="Abertura" value={formatPrice(quote.open)} /> : null}
              {quote.previousClose !== null ? (
                <Stat label="Fechamento anterior" value={formatPrice(quote.previousClose)} />
              ) : null}
              {quote.volume !== null ? <Stat label="Volume" value={formatCompact(quote.volume)} /> : null}
              {quote.marketCap !== null ? (
                <Stat label="Valor de mercado" value={`R$ ${formatCompact(quote.marketCap)}`} />
              ) : null}
              {quote.fiftyTwoWeekLow !== null && quote.fiftyTwoWeekHigh !== null ? (
                <Stat
                  wide
                  label="Mínima e máxima em 52 semanas"
                  value={`${formatPrice(quote.fiftyTwoWeekLow)} – ${formatPrice(quote.fiftyTwoWeekHigh)}`}
                />
              ) : null}
            </View>

            <Text variant="caption" tone="tertiary" style={styles.source}>
              Dados da brapi.dev, com até 30 min de atraso. Atualizado {formatUpdatedAt(quote.updatedAt)}.
            </Text>
          </>
        ) : loading ? (
          <DetailSkeleton />
        ) : (
          <View style={styles.errorBox}>
            <Text variant="body" tone="secondary" style={styles.errorText}>
              {error ?? `Não encontramos a cotação de ${symbol} agora.`}
            </Text>
            <Button variant="secondary" size="compact" label="Tentar de novo" onPress={refresh} />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          label="Ver no Google Finance"
          icon={<ExternalLink size={16} strokeWidth={1.8} color={colors.ink} />}
          onPress={openGoogleFinance}
        />
        {isFollowing(symbol) ? (
          <Button variant="ghost" size="compact" label="Deixar de seguir" onPress={confirmUnfollow} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const useStyles = themedStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.surface,
    paddingTop: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 20,
  },
  identity: {
    flex: 1,
    gap: 1,
  },
  closeButton: {
    alignSelf: "flex-start",
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: c.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: c.border,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 22,
  },
  priceBlock: {
    gap: 8,
  },
  price: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  section: {
    gap: 10,
  },
  rangeTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: c.neutralSoft,
    justifyContent: "center",
  },
  rangeFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: c.primarySoft,
  },
  rangeMarker: {
    position: "absolute",
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: c.surface,
    backgroundColor: c.primary,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stat: {
    flexBasis: "47%",
    flexGrow: 1,
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: SinoRadius.control,
    backgroundColor: c.neutralMuted,
  },
  statWide: {
    flexBasis: "100%",
  },
  statValue: {
    fontSize: 15,
  },
  source: {
    lineHeight: 18,
  },
  skeletonGroup: {
    gap: 10,
  },
  skeleton: {
    borderRadius: 6,
    backgroundColor: c.skeleton,
  },
  errorBox: {
    alignItems: "center",
    gap: 14,
    paddingTop: 24,
  },
  errorText: {
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 4,
  },
}));
