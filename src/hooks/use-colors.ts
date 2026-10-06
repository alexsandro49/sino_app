import { StyleSheet, useColorScheme } from "react-native";

import { darkColors, lightColors, type SinoColors } from "@/constants/theme";

export function useColors(): SinoColors {
  return useColorScheme() === "dark" ? darkColors : lightColors;
}

export function themedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: SinoColors) => T) {
  const light = StyleSheet.create(factory(lightColors));
  const dark = StyleSheet.create(factory(darkColors));

  return function useThemedStyles(): T {
    return useColorScheme() === "dark" ? dark : light;
  };
}
