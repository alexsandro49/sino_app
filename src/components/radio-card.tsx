import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { SinoRadius } from "@/constants/theme";
import { themedStyles, useColors } from "@/hooks/use-colors";

type RadioCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function RadioCard({ icon: Icon, title, description, selected, disabled = false, onPress }: RadioCardProps) {
  const colors = useColors();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && !selected && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
        <Icon size={18} strokeWidth={1.7} color={selected ? colors.primaryText : colors.textSecondary} />
      </View>
      <View style={styles.text}>
        <Text variant="ticker" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" tone="secondary" style={styles.description}>
          {description}
        </Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const useStyles = themedStyles((c) => ({
  card: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: SinoRadius.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    backgroundColor: c.surface,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: c.primaryText,
    paddingVertical: 12.5,
    paddingHorizontal: 13.5,
  },
  cardPressed: {
    backgroundColor: c.neutralSoft,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: SinoRadius.icon,
    backgroundColor: c.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: c.primarySoft,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    lineHeight: 19,
  },
  description: {
    lineHeight: 18,
  },
  radio: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: c.radioBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: c.primaryText,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primaryText,
  },
}));
