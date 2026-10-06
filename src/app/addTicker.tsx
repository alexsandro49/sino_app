import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Check, Plus, Search, X } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useTickerSearch } from "@/hooks/use-ticker-search";
import type { Ticker } from "@/services/market";

export default function AddTicker() {
  const router = useRouter();
  const { isFollowing, follow } = useWatchlist();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ticker[]>([]);
  const [saving, setSaving] = useState(false);
  const { results, loading, error } = useTickerSearch(query);

  function isSelected(symbol: string) {
    return selected.some((ticker) => ticker.symbol === symbol);
  }

  function toggle(ticker: Ticker) {
    Haptics.selectionAsync();
    setSelected((current) =>
      current.some((item) => item.symbol === ticker.symbol)
        ? current.filter((item) => item.symbol !== ticker.symbol)
        : [...current, ticker],
    );
  }

  const addLabel =
    selected.length === 0
      ? "Escolha os tickers"
      : selected.length === 1
        ? `Adicionar ${selected[0].symbol}`
        : `Adicionar ${selected.length} tickers`;

  async function handleAdd() {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await follow(selected);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Alert.alert("Não deu pra adicionar", err instanceof Error ? err.message : "Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }: { item: Ticker }) {
    const following = isFollowing(item.symbol);
    const checked = isSelected(item.symbol);

    return (
      <Pressable
        disabled={following}
        onPress={() => toggle(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: following }}
        accessibilityLabel={`${item.symbol}, ${item.name}`}
        style={({ pressed }) => [
          styles.item,
          (checked || pressed) && styles.itemHighlighted,
          following && styles.itemDisabled,
        ]}
      >
        <View style={[styles.monogram, checked && styles.monogramChecked]}>
          <Text variant="overline" tone={checked ? "primary" : "secondary"} style={styles.monogramText}>
            {item.symbol.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <Text variant="ticker" style={styles.itemSymbol}>
            {item.symbol}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        {following ? (
          <Text variant="caption" tone="secondary">
            já segue
          </Text>
        ) : checked ? (
          <View style={styles.checkCircle}>
            <Check size={14} strokeWidth={2.2} color={SinoBrand.white} />
          </View>
        ) : (
          <Plus size={18} strokeWidth={1.9} color={SinoBrand.placeholder} />
        )}
      </Pressable>
    );
  }

  const trimmedQuery = query.trim();

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.header}>
        <Text variant="section">Adicionar ticket</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <X size={15} strokeWidth={1.9} color={SinoBrand.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.searchArea}>
        <TextField
          leading={<Search size={18} strokeWidth={1.8} color={SinoBrand.primary} />}
          trailing={loading ? <ActivityIndicator size="small" color={SinoBrand.textTertiary} /> : null}
          placeholder="Código ou nome da empresa"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="search"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {selected.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {selected.map((ticker) => (
            <Pressable
              key={ticker.symbol}
              onPress={() => toggle(ticker)}
              accessibilityRole="button"
              accessibilityLabel={`Tirar ${ticker.symbol} da seleção`}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <Text variant="label" tone="primary" style={styles.chipText}>
                {ticker.symbol}
              </Text>
              <X size={13} strokeWidth={2.2} color={SinoBrand.primary} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(ticker) => ticker.symbol}
        renderItem={renderItem}
        extraData={selected}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          results.length > 0 ? (
            <Text variant="overline" tone="tertiary" style={styles.sectionLabel}>
              Disponíveis na B3
            </Text>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : trimmedQuery ? (
            <Text variant="body" tone={error ? "down" : "secondary"} style={styles.emptyText}>
              {error ?? `Nada encontrado pra "${trimmedQuery}".`}
            </Text>
          ) : (
            <Text variant="body" tone="tertiary" style={styles.emptyText}>
              Busque por PETR4, VALE3, MXRF11…
            </Text>
          )
        }
      />

      <View style={styles.footer}>
        <Button label={addLabel} disabled={selected.length === 0} loading={saving} onPress={handleAdd} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SinoBrand.white,
    paddingTop: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 17,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: SinoBrand.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: SinoBrand.border,
  },
  searchArea: {
    paddingHorizontal: 20,
  },
  searchInput: {
    fontFamily: SinoFonts.semibold,
    fontSize: 16,
  },
  chipsScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 8,
    backgroundColor: SinoBrand.primarySoft,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontFamily: SinoFonts.semibold,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 12,
    gap: 2,
  },
  sectionLabel: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
    borderRadius: SinoRadius.control,
  },
  itemHighlighted: {
    backgroundColor: SinoBrand.primaryTint,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  monogram: {
    width: 36,
    height: 36,
    borderRadius: SinoRadius.icon,
    backgroundColor: SinoBrand.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  monogramChecked: {
    backgroundColor: SinoBrand.primarySoft,
  },
  monogramText: {
    fontFamily: SinoFonts.semibold,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemSymbol: {
    fontSize: 15,
    lineHeight: 19,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SinoBrand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    paddingTop: 28,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
