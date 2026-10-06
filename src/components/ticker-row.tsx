import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoBrand, SinoRadius } from "@/constants/theme";
import type { Quote, Ticker } from "@/services/market";

type TickerRowProps = {
  ticker: Ticker;
  quote?: Quote;
  pending?: boolean;
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

const FLAT_THRESHOLD = 0.005;

function trendOf(changePercent: number) {
  if (Math.abs(changePercent) < FLAT_THRESHOLD) {
    return { Icon: Minus, tone: "secondary", iconColor: SinoBrand.textSecondary, background: SinoBrand.neutralSoft } as const;
  }
  if (changePercent > 0) {
    return { Icon: TrendingUp, tone: "up", iconColor: SinoBrand.upIcon, background: SinoBrand.upSoft } as const;
  }
  return { Icon: TrendingDown, tone: "down", iconColor: SinoBrand.down, background: SinoBrand.downSoft } as const;
}

function formatChange(changePercent: number) {
  if (Math.abs(changePercent) < FLAT_THRESHOLD) return "0,00%";
  const sign = changePercent > 0 ? "+" : "−";
  return `${sign}${percentFormatter.format(Math.abs(changePercent))}%`;
}

export function TickerRow({ ticker, quote, pending = false, onLongPress }: TickerRowProps) {
  const trend = quote ? trendOf(quote.changePercent) : null;

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={
        quote ? `${ticker.symbol}, ${formatChange(quote.changePercent)}, ${priceFormatter.format(quote.price)}` : ticker.symbol
      }
      accessibilityHint="Segure para deixar de seguir"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.iconBox, { backgroundColor: trend?.background ?? SinoBrand.neutralSoft }]}>
        {trend ? <trend.Icon size={19} strokeWidth={1.9} color={trend.iconColor} /> : null}
      </View>

      <View style={styles.info}>
        <Text variant="ticker">{ticker.symbol}</Text>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {ticker.name}
        </Text>
      </View>

      {quote && trend ? (
        <View style={styles.values}>
          <Text variant="value" tone={trend.tone}>
            {formatChange(quote.changePercent)}
          </Text>
          <Text variant="caption" tone="tertiary">
            {priceFormatter.format(quote.price)}
          </Text>
        </View>
      ) : pending ? (
        <View style={styles.values}>
          <View style={[styles.skeleton, styles.skeletonValue]} />
          <View style={[styles.skeleton, styles.skeletonPrice]} />
        </View>
      ) : (
        <View style={styles.values}>
          <Text variant="value" tone="tertiary">
            —
          </Text>
          <Text variant="caption" tone="tertiary">
            sem cotação
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function TickerRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: SinoBrand.neutralSoft }]} />
      <View style={styles.info}>
        <View style={[styles.skeleton, styles.skeletonSymbol]} />
        <View style={[styles.skeleton, styles.skeletonName]} />
      </View>
      <View style={styles.values}>
        <View style={[styles.skeleton, styles.skeletonValue]} />
        <View style={[styles.skeleton, styles.skeletonPrice]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: SinoBrand.cardBorder,
    backgroundColor: SinoBrand.white,
  },
  cardPressed: {
    backgroundColor: SinoBrand.neutralSoft,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: SinoRadius.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  values: {
    alignItems: "flex-end",
    gap: 4,
  },
  skeleton: {
    borderRadius: 4,
    backgroundColor: SinoBrand.skeleton,
  },
  skeletonSymbol: {
    width: 64,
    height: 14,
  },
  skeletonName: {
    width: 120,
    height: 11,
    marginTop: 4,
  },
  skeletonValue: {
    width: 56,
    height: 15,
  },
  skeletonPrice: {
    width: 44,
    height: 11,
  },
});
