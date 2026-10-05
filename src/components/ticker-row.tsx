import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SinoBrand } from "@/constants/theme";
import type { Quote, Ticker } from "@/services/market";

type TickerRowProps = {
  ticker: Ticker;
  quote?: Quote;
  onLongPress?: () => void;
};

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function trendOf(changePercent: number | undefined) {
  if (changePercent === undefined || Math.abs(changePercent) < 0.005) {
    return { Icon: Minus, color: SinoBrand.textSecondary, iconColor: SinoBrand.textSecondary, background: SinoBrand.neutralSoft };
  }
  if (changePercent > 0) {
    return { Icon: TrendingUp, color: SinoBrand.up, iconColor: SinoBrand.upIcon, background: SinoBrand.upSoft };
  }
  return { Icon: TrendingDown, color: SinoBrand.down, iconColor: SinoBrand.down, background: SinoBrand.downSoft };
}

function formatChange(changePercent: number) {
  const sign = changePercent > 0.005 ? "+" : changePercent < -0.005 ? "−" : "";
  return `${sign}${percentFormatter.format(Math.abs(changePercent))}%`;
}

export function TickerRow({ ticker, quote, onLongPress }: TickerRowProps) {
  const trend = trendOf(quote?.changePercent);

  return (
    <Pressable
      style={styles.card}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityHint="Segure para deixar de seguir"
    >
      <View style={[styles.iconBox, { backgroundColor: trend.background }]}>
        <trend.Icon size={19} strokeWidth={1.9} color={trend.iconColor} />
      </View>

      <View style={styles.info}>
        <ThemedText style={styles.symbol}>{ticker.symbol}</ThemedText>
        <ThemedText style={styles.name} numberOfLines={1}>
          {ticker.name}
        </ThemedText>
      </View>

      <View style={styles.values}>
        <ThemedText style={[styles.change, { color: trend.color }]}>
          {quote ? formatChange(quote.changePercent) : "—"}
        </ThemedText>
        <ThemedText style={styles.price}>{quote ? priceFormatter.format(quote.price) : ""}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SinoBrand.cardBorder,
    backgroundColor: SinoBrand.white,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "600",
    color: SinoBrand.ink,
  },
  name: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "400",
    color: SinoBrand.textSecondary,
  },
  values: {
    alignItems: "flex-end",
    gap: 2,
  },
  change: {
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.15,
  },
  price: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "400",
    color: SinoBrand.textTertiary,
  },
});
