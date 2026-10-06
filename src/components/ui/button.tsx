import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoFonts, SinoRadius, type SinoColors } from "@/constants/theme";
import { themedStyles, useColors } from "@/hooks/use-colors";

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

const labelColor: Record<ButtonVariant, keyof SinoColors> = {
  primary: "onPrimary",
  secondary: "ink",
  destructive: "down",
  ghost: "textSecondary",
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
  const colors = useColors();
  const styles = useStyles();
  const isDisabled = disabled || loading;
  const color = colors[labelColor[variant]];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === "compact" ? styles.compact : styles.regular,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, variant === "ghost" && styles.ghostLabel, { color }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = themedStyles((c) => ({
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
  primary: {
    backgroundColor: c.primary,
  },
  primaryPressed: {
    backgroundColor: c.primaryPressed,
  },
  secondary: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  secondaryPressed: {
    backgroundColor: c.neutralSoft,
  },
  destructive: {
    borderWidth: 1,
    borderColor: c.destructiveBorder,
  },
  destructivePressed: {
    backgroundColor: c.downSoft,
  },
  ghost: {},
  ghostPressed: {
    backgroundColor: c.neutralSoft,
  },
}));
