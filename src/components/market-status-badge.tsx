import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SinoBrand } from "@/constants/theme";

export function MarketStatusBadge({ open }: { open: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: open ? SinoBrand.upSoft : SinoBrand.neutralSoft }]}>
      <View style={[styles.dot, { backgroundColor: open ? SinoBrand.upIcon : SinoBrand.textTertiary }]} />
      <ThemedText style={[styles.label, { color: open ? SinoBrand.up : SinoBrand.textSecondary }]}>
        {open ? "Pregão aberto · parcial" : "Pregão fechado · final do dia"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "600",
  },
});
