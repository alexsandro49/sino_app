import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from "react-native";

import { SinoFonts, type SinoColors } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";

type TextVariant =
  | "display"
  | "hero"
  | "title"
  | "heading"
  | "section"
  | "ticker"
  | "value"
  | "body"
  | "label"
  | "overline"
  | "caption";

type TextTone = "ink" | "secondary" | "tertiary" | "primary" | "up" | "down" | "onPrimary";

export type TextProps = NativeTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const toneColor: Record<TextTone, keyof SinoColors> = {
  ink: "ink",
  secondary: "textSecondary",
  tertiary: "textTertiary",
  primary: "primaryText",
  up: "up",
  down: "down",
  onPrimary: "onPrimary",
};

export function Text({ variant = "body", tone = "ink", style, ...rest }: TextProps) {
  const colors = useColors();
  return <NativeText {...rest} style={[styles[variant], { color: colors[toneColor[tone]] }, style]} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: SinoFonts.semibold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.9,
  },
  hero: {
    fontFamily: SinoFonts.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.84,
  },
  title: {
    fontFamily: SinoFonts.semibold,
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.75,
  },
  heading: {
    fontFamily: SinoFonts.semibold,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.38,
  },
  section: {
    fontFamily: SinoFonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.36,
  },
  ticker: {
    fontFamily: SinoFonts.semibold,
    fontSize: 15.5,
    lineHeight: 20,
  },
  value: {
    fontFamily: SinoFonts.semibold,
    fontSize: 16.5,
    lineHeight: 21,
    letterSpacing: -0.16,
  },
  body: {
    fontFamily: SinoFonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: SinoFonts.medium,
    fontSize: 13.5,
    lineHeight: 18,
  },
  overline: {
    fontFamily: SinoFonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: SinoFonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
});
