import { Bell, BellRing, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { SinoRadius } from "@/constants/theme";
import { themedStyles, useColors } from "@/hooks/use-colors";
import { usePriceAlerts } from "@/hooks/use-price-alerts";
import { parsePrice, type AlertDirection, type PriceAlert } from "@/services/alerts";
import { formatPrice, formatUpdatedAt } from "@/utils/format";

const DIRECTIONS: { value: AlertDirection; label: string }[] = [
  { value: "above", label: "Acima de" },
  { value: "below", label: "Abaixo de" },
];

function AlertRow({ alert, onRemove }: { alert: PriceAlert; onRemove: () => void }) {
  const colors = useColors();
  const styles = useStyles();
  const triggered = alert.triggeredAt !== null;
  const Icon = triggered ? BellRing : Bell;
  const directionLabel = alert.direction === "above" ? "Acima de" : "Abaixo de";

  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, triggered && styles.rowIconTriggered]}>
        <Icon size={16} strokeWidth={1.9} color={triggered ? colors.up : colors.primaryText} />
      </View>
      <View style={styles.rowText}>
        <Text variant="label">
          {directionLabel} {formatPrice(alert.targetPrice)}
        </Text>
        <Text variant="caption" tone={triggered ? "up" : "secondary"}>
          {alert.triggeredAt !== null && alert.triggeredPrice !== null
            ? `Disparou ${formatUpdatedAt(alert.triggeredAt)}, em ${formatPrice(alert.triggeredPrice)}`
            : "Ativo. Avisamos assim que o preço chegar lá."}
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        accessibilityLabel="Remover alerta"
        accessibilityRole="button"
        hitSlop={10}
        style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
      >
        <X size={14} strokeWidth={1.9} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export function PriceAlerts({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const styles = useStyles();
  const { alerts, saving, error, add, remove } = usePriceAlerts(symbol);
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [priceText, setPriceText] = useState("");
  const targetPrice = parsePrice(priceText);

  async function submit() {
    if (targetPrice === null) return;

    if (await add(direction, targetPrice)) {
      setPriceText("");
    }
  }

  return (
    <View style={styles.section}>
      <Text variant="overline" tone="tertiary">
        Alertas de preço
      </Text>

      <View style={styles.directions}>
        {DIRECTIONS.map((option) => {
          const selected = option.value === direction;
          return (
            <Pressable
              key={option.value}
              onPress={() => setDirection(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.direction, selected && styles.directionSelected]}
            >
              <Text variant="label" tone={selected ? "primary" : "secondary"}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <TextField
            value={priceText}
            onChangeText={setPriceText}
            placeholder={formatPrice(currentPrice)}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={submit}
            accessibilityLabel="Preço do alerta"
          />
        </View>
        <Button
          label="Criar alerta"
          onPress={submit}
          loading={saving}
          disabled={targetPrice === null}
          style={styles.submit}
        />
      </View>

      {error ? (
        <Text variant="caption" tone="down">
          {error}
        </Text>
      ) : null}

      {alerts.map((alert) => (
        <AlertRow key={alert.id} alert={alert} onRemove={() => remove(alert.id)} />
      ))}
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  section: {
    gap: 10,
  },
  directions: {
    flexDirection: "row",
    gap: 8,
  },
  direction: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SinoRadius.control,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  directionSelected: {
    borderColor: c.primaryText,
    backgroundColor: c.primaryTint,
  },
  form: {
    flexDirection: "row",
    gap: 8,
  },
  field: {
    flex: 1,
  },
  submit: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SinoRadius.control,
    backgroundColor: c.neutralMuted,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: SinoRadius.icon,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.primarySoft,
  },
  rowIconTriggered: {
    backgroundColor: c.upSoft,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonPressed: {
    backgroundColor: c.border,
  },
}));
