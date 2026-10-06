import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts } from "@/constants/theme";

export function MarketStatusBadge({ open }: { open: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: open ? SinoBrand.upSoft : SinoBrand.neutralSoft }]}>
      <View style={[styles.dot, { backgroundColor: open ? SinoBrand.upIcon : SinoBrand.textTertiary }]} />
      <Text variant="caption" tone={open ? "up" : "secondary"} style={styles.label}>
        {open ? "Pregão aberto · parcial" : "Pregão fechado · números do dia"}
      </Text>
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
    fontFamily: SinoFonts.semibold,
  },
});
