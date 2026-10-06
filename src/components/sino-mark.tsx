import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

type SinoMarkProps = {
  size?: number;
  muted?: boolean;
};

export function SinoMark({ size = 46, muted = false }: SinoMarkProps) {
  const colors = useColors();
  const domeHeight = size / 2;
  const baseWidth = size * 1.17;
  const baseHeight = Math.max(2, size * 0.087);
  const clapper = Math.max(3.5, size * 0.174);
  const detailColor = muted ? colors.mutedMark : colors.markDetail;

  return (
    <View style={[styles.container, { gap: Math.max(1.5, size * 0.087) }]} accessible={false}>
      {muted ? (
        <View style={{ width: size, height: domeHeight, overflow: "hidden" }}>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: domeHeight,
              borderWidth: Math.max(1, size * 0.03),
              borderColor: colors.mutedMarkOutline,
              borderStyle: "dashed",
            }}
          />
        </View>
      ) : (
        <View
          style={{
            width: size,
            height: domeHeight,
            borderTopLeftRadius: domeHeight,
            borderTopRightRadius: domeHeight,
            borderBottomLeftRadius: size * 0.065,
            borderBottomRightRadius: size * 0.065,
            backgroundColor: colors.markDome,
          }}
        />
      )}
      <View
        style={{
          width: baseWidth,
          height: baseHeight,
          borderRadius: baseHeight / 2,
          backgroundColor: detailColor,
        }}
      />
      <View
        style={{
          width: clapper,
          height: clapper,
          borderRadius: clapper / 2,
          backgroundColor: detailColor,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
