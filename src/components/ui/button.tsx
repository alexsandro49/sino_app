import type { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SinoBrand } from "@/constants/theme";

type ButtonVariant = "primary" | "outlined";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.outlined,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? SinoBrand.white : SinoBrand.ink} />
      ) : (
        <View style={styles.content}>
          {icon}
          <ThemedText style={[styles.label, isPrimary ? styles.primaryLabel : styles.outlinedLabel]}>
            {label}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primary: {
    backgroundColor: SinoBrand.primary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: SinoBrand.border,
    backgroundColor: SinoBrand.white,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryLabel: {
    color: SinoBrand.white,
  },
  outlinedLabel: {
    color: SinoBrand.ink,
  },
});
