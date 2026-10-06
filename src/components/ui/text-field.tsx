import { useState, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { SinoFonts, SinoRadius } from "@/constants/theme";
import { themedStyles, useColors } from "@/hooks/use-colors";

type TextFieldProps = TextInputProps & {
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function TextField({ leading, trailing, style, onFocus, onBlur, ...props }: TextFieldProps) {
  const colors = useColors();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      {leading}
      <TextInput
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primaryText}
        keyboardAppearance="default"
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

const useStyles = themedStyles((c) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 15,
    borderRadius: SinoRadius.control,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  focused: {
    borderWidth: 1.5,
    borderColor: c.primaryText,
    paddingHorizontal: 14.5,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: SinoFonts.regular,
    fontSize: 15,
    color: c.ink,
  },
}));
