import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts } from "@/constants/theme";

type TickerLogoProps = {
  symbol: string;
  logoUrl?: string | null;
  size?: number;
};

export function TickerLogo({ symbol, logoUrl, size = 38 }: TickerLogoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(logoUrl) && failedUrl !== logoUrl;
  const radius = Math.round(size * 0.27);

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius }]}>
      {showImage ? (
        <Image
          source={{ uri: logoUrl! }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={120}
          onError={() => setFailedUrl(logoUrl ?? null)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text
          variant="overline"
          tone="secondary"
          style={[styles.monogram, { fontSize: Math.max(11, size * 0.34) }]}
        >
          {symbol.slice(0, 2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SinoBrand.neutralSoft,
  },
  monogram: {
    fontFamily: SinoFonts.semibold,
  },
});
