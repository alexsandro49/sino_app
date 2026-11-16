import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { darkColors, lightColors, type SinoColors } from "@/constants/theme";

export function useColors(): SinoColors {
  return useColorScheme() === "dark" ? darkColors : lightColors;
}

type NamedStyles<T> = { [K in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function themedStyles<T extends NamedStyles<T>>(factory: (colors: SinoColors) => T) {
  const light = StyleSheet.create(factory(lightColors));
  const dark = StyleSheet.create(factory(darkColors));

  return function useThemedStyles(): T {
    return useColorScheme() === "dark" ? dark : light;
  };
}
