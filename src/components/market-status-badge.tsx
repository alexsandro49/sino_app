import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoFonts } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";

export function MarketStatusBadge({ open }: { open: boolean }) {
  const colors = useColors();

  return (
    <View style={[styles.badge, { backgroundColor: open ? colors.upSoft : colors.neutralSoft }]}>
      <View style={[styles.dot, { backgroundColor: open ? colors.upIcon : colors.textTertiary }]} />
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
