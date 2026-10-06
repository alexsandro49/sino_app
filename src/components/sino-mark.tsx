import { StyleSheet, View } from "react-native";

import { SinoBrand } from "@/constants/theme";

type SinoMarkProps = {
  size?: number;
  muted?: boolean;
};

export function SinoMark({ size = 46, muted = false }: SinoMarkProps) {
  const domeHeight = size / 2;
  const baseWidth = size * 1.17;
  const baseHeight = Math.max(2, size * 0.087);
  const clapper = Math.max(3.5, size * 0.174);
  const detailColor = muted ? SinoBrand.mutedMark : SinoBrand.ink;

  return (
    <View style={[styles.container, { gap: Math.max(1.5, size * 0.087) }]} accessible={false}>
      {muted ? (
        <View style={{ width: size, height: domeHeight, overflow: "hidden" }}>
          <View
            style={[
              styles.mutedDome,
              {
                width: size,
                height: size,
                borderRadius: domeHeight,
                borderWidth: Math.max(1, size * 0.03),
              },
            ]}
          />
        </View>
      ) : (
        <View
          style={[
            styles.dome,
            {
              width: size,
              height: domeHeight,
              borderTopLeftRadius: domeHeight,
              borderTopRightRadius: domeHeight,
              borderBottomLeftRadius: size * 0.065,
              borderBottomRightRadius: size * 0.065,
            },
          ]}
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
  dome: {
    backgroundColor: SinoBrand.primary,
  },
  mutedDome: {
    borderColor: SinoBrand.mutedMarkOutline,
    borderStyle: "dashed",
  },
});
