import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import { Pressable, View, type PressableProps } from "react-native";

import { TickerLogo } from "@/components/ticker-logo";
import { Text } from "@/components/ui/text";
import { SinoFonts, SinoRadius, type SinoColors } from "@/constants/theme";
import type { Quote, Ticker } from "@/services/market";
import { formatChange, formatPrice, trendOf, type Trend } from "@/utils/format";
import { themedStyles, useColors } from "@/hooks/use-colors";

type TickerRowProps = {
  ticker: Ticker;
  quote?: Quote;
  pending?: boolean;
  onPress?: () => void;
  accessibilityActions?: PressableProps["accessibilityActions"];
  onAccessibilityAction?: PressableProps["onAccessibilityAction"];
};

export const trendStyle = {
  flat: { Icon: Minus, tone: "secondary", iconColor: "textSecondary", background: "neutralSoft" },
  up: { Icon: TrendingUp, tone: "up", iconColor: "up", background: "upSoft" },
  down: { Icon: TrendingDown, tone: "down", iconColor: "down", background: "downSoft" },
} as const satisfies Record<Trend, { iconColor: keyof SinoColors; background: keyof SinoColors } & Record<string, unknown>>;

export function ChangePill({ changePercent }: { changePercent: number }) {
  const colors = useColors();
  const styles = useStyles();
  const trend: Trend = trendOf(changePercent);
  const style = trendStyle[trend];

  return (
    <View style={[styles.pill, { backgroundColor: colors[style.background] }]}>
      <style.Icon size={13} strokeWidth={2.2} color={colors[style.iconColor]} />
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
  const styles = useStyles();
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
  const styles = useStyles();
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

const useStyles = themedStyles((c) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    backgroundColor: c.surface,
  },
  cardPressed: {
    backgroundColor: c.neutralSoft,
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
    backgroundColor: c.skeleton,
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
}));
