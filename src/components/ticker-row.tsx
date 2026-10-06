import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import { Pressable, StyleSheet, View, type PressableProps } from "react-native";

import { TickerLogo } from "@/components/ticker-logo";
import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";
import type { Quote, Ticker } from "@/services/market";
import { formatChange, formatPrice, trendOf, type Trend } from "@/utils/format";

type TickerRowProps = {
  ticker: Ticker;
  quote?: Quote;
  pending?: boolean;
  onPress?: () => void;
  accessibilityActions?: PressableProps["accessibilityActions"];
  onAccessibilityAction?: PressableProps["onAccessibilityAction"];
};

export const trendStyle = {
  flat: { Icon: Minus, tone: "secondary", iconColor: SinoBrand.textSecondary, background: SinoBrand.neutralSoft },
  up: { Icon: TrendingUp, tone: "up", iconColor: SinoBrand.up, background: SinoBrand.upSoft },
  down: { Icon: TrendingDown, tone: "down", iconColor: SinoBrand.down, background: SinoBrand.downSoft },
} as const;

export function ChangePill({ changePercent }: { changePercent: number }) {
  const trend: Trend = trendOf(changePercent);
  const style = trendStyle[trend];

  return (
    <View style={[styles.pill, { backgroundColor: style.background }]}>
      <style.Icon size={13} strokeWidth={2.2} color={style.iconColor} />
      <Text variant="label" tone={style.tone} style={styles.pillText}>
        {formatChange(changePercent)}
      </Text>
    </View>
  );
}

export function TickerRow({
  ticker,
  quote,
  pending = false,
  onPress,
  accessibilityActions,
  onAccessibilityAction,
}: TickerRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      accessibilityRole="button"
      accessibilityLabel={
        quote ? `${ticker.symbol}, ${formatChange(quote.changePercent)}, ${formatPrice(quote.price)}` : ticker.symbol
      }
      accessibilityHint="Toque para ver os detalhes."
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <TickerLogo symbol={ticker.symbol} logoUrl={quote?.logoUrl ?? ticker.logoUrl} size={40} />

      <View style={styles.info}>
        <Text variant="ticker">{ticker.symbol}</Text>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {ticker.name}
        </Text>
      </View>

      {quote ? (
        <View style={styles.values}>
          <ChangePill changePercent={quote.changePercent} />
          <Text variant="caption" tone="secondary">
            {formatPrice(quote.price)}
          </Text>
        </View>
      ) : pending ? (
        <View style={styles.values}>
          <View style={[styles.skeleton, styles.skeletonPill]} />
          <View style={[styles.skeleton, styles.skeletonPrice]} />
        </View>
      ) : (
        <View style={styles.values}>
          <Text variant="label" tone="tertiary">
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
      <View style={[styles.skeleton, styles.skeletonLogo]} />
      <View style={styles.info}>
        <View style={[styles.skeleton, styles.skeletonSymbol]} />
        <View style={[styles.skeleton, styles.skeletonName]} />
      </View>
      <View style={styles.values}>
        <View style={[styles.skeleton, styles.skeletonPill]} />
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: SinoBrand.cardBorder,
    backgroundColor: SinoBrand.white,
  },
  cardPressed: {
    backgroundColor: SinoBrand.neutralSoft,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  values: {
    alignItems: "flex-end",
    gap: 5,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 7,
    paddingRight: 8,
    borderRadius: 7,
  },
  pillText: {
    fontFamily: SinoFonts.semibold,
    fontSize: 14,
    lineHeight: 17,
  },
  skeleton: {
    borderRadius: 4,
    backgroundColor: SinoBrand.skeleton,
  },
  skeletonLogo: {
    width: 40,
    height: 40,
    borderRadius: 11,
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
  skeletonPill: {
    width: 70,
    height: 25,
    borderRadius: 7,
  },
  skeletonPrice: {
    width: 50,
    height: 11,
  },
});
