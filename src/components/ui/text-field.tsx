import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { SinoBrand } from "@/constants/theme";

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={SinoBrand.textSecondary}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: SinoBrand.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: SinoBrand.ink,
    backgroundColor: SinoBrand.white,
  },
});
