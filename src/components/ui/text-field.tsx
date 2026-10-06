import { useState, type ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";

type TextFieldProps = TextInputProps & {
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function TextField({ leading, trailing, style, onFocus, onBlur, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      {leading}
      <TextInput
        placeholderTextColor={SinoBrand.placeholder}
        selectionColor={SinoBrand.primary}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, style]}
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.control,
    borderWidth: 1,
    borderColor: SinoBrand.border,
    backgroundColor: SinoBrand.white,
  },
  focused: {
    borderWidth: 1.5,
    borderColor: SinoBrand.primary,
    paddingHorizontal: 14.5,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: SinoFonts.regular,
    fontSize: 15,
    color: SinoBrand.ink,
  },
});
