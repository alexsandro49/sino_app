import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
type ButtonSize = "regular" | "compact";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const labelColor: Record<ButtonVariant, string> = {
  primary: SinoBrand.white,
  secondary: SinoBrand.ink,
  destructive: SinoBrand.down,
  ghost: SinoBrand.textSecondary,
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "regular",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === "compact" ? styles.compact : styles.regular,
        variantStyles[variant],
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.label,
              variant === "ghost" && styles.ghostLabel,
              { color: labelColor[variant] },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: SinoRadius.control,
    justifyContent: "center",
    alignItems: "center",
  },
  regular: {
    height: 52,
    paddingHorizontal: 18,
  },
  compact: {
    height: 46,
    paddingHorizontal: 18,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  label: {
    fontFamily: SinoFonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  ghostLabel: {
    fontFamily: SinoFonts.medium,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: SinoBrand.primary,
  },
  secondary: {
    backgroundColor: SinoBrand.white,
    borderWidth: 1,
    borderColor: SinoBrand.border,
  },
  destructive: {
    borderWidth: 1,
    borderColor: SinoBrand.destructiveBorder,
  },
  ghost: {},
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: SinoBrand.primaryPressed,
  },
  secondary: {
    backgroundColor: SinoBrand.neutralSoft,
  },
  destructive: {
    backgroundColor: SinoBrand.downSoft,
  },
  ghost: {
    backgroundColor: SinoBrand.neutralSoft,
  },
});
