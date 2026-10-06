import { useRouter } from "expo-router";
import { Check, Plus, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { SinoBrand } from "@/constants/theme";
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
      router.back();
    } catch (err) {
      Alert.alert(
        "Não deu pra adicionar",
        err instanceof Error ? err.message : "Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }: { item: Ticker }) {
    const following = isFollowing(item.symbol);
    const checked = isSelected(item.symbol);

    return (
      <Pressable
        style={[styles.item, checked && styles.itemSelected, following && styles.itemDisabled]}
        disabled={following}
        onPress={() => toggle(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: following }}
      >
        <View style={[styles.avatar, checked && styles.avatarSelected]}>
          <ThemedText style={[styles.avatarText, checked && styles.avatarTextSelected]}>
            {item.symbol.slice(0, 2)}
          </ThemedText>
        </View>
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemSymbol}>{item.symbol}</ThemedText>
          <ThemedText style={styles.itemName} numberOfLines={1}>
            {item.name}
          </ThemedText>
        </View>
        {following ? (
          <ThemedText style={styles.followingText}>já segue</ThemedText>
        ) : checked ? (
          <View style={styles.checkCircle}>
            <Check size={14} strokeWidth={2.2} color={SinoBrand.white} />
          </View>
        ) : (
          <Plus size={18} strokeWidth={1.9} color={SinoBrand.textTertiary} />
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Adicionar ticket</ThemedText>
        <Pressable style={styles.closeButton} onPress={() => router.back()} accessibilityLabel="Fechar">
          <X size={15} strokeWidth={1.9} color={SinoBrand.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.searchField}>
        <Search size={18} strokeWidth={1.8} color={SinoBrand.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busque por código ou empresa"
          placeholderTextColor={SinoBrand.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          value={query}
          onChangeText={setQuery}
        />
        {loading && <ActivityIndicator size="small" color={SinoBrand.primary} />}
      </View>

      {selected.length > 0 && (
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
              style={styles.chip}
              onPress={() => toggle(ticker)}
              accessibilityLabel={`Remover ${ticker.symbol} da seleção`}
            >
              <ThemedText style={styles.chipText}>{ticker.symbol}</ThemedText>
              <X size={13} strokeWidth={2} color={SinoBrand.primary} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={results}
        keyExtractor={(ticker) => ticker.symbol}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          results.length > 0 ? <ThemedText style={styles.sectionLabel}>Disponíveis na B3</ThemedText> : null
        }
        ListEmptyComponent={
          query.trim() && !loading ? (
            <ThemedText style={styles.emptyText}>{error ?? "Nenhum ticker encontrado."}</ThemedText>
          ) : null
        }
      />

      <View style={styles.footer}>
        <Button
          label={addLabel}
          disabled={selected.length === 0}
          loading={saving}
          onPress={handleAdd}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SinoBrand.white,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 17,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: -0.36,
    color: SinoBrand.ink,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: SinoBrand.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: SinoBrand.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: SinoBrand.ink,
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
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: SinoBrand.primarySoft,
  },
  chipText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "600",
    color: SinoBrand.primary,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 12,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: SinoBrand.textTertiary,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
    borderRadius: 12,
  },
  itemSelected: {
    backgroundColor: "#F2F5FD",
  },
  itemDisabled: {
    opacity: 0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SinoBrand.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSelected: {
    backgroundColor: SinoBrand.primarySoft,
  },
  avatarText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
    color: SinoBrand.textSecondary,
  },
  avatarTextSelected: {
    color: SinoBrand.primary,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemSymbol: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "600",
    color: SinoBrand.ink,
  },
  itemName: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "400",
    color: SinoBrand.textSecondary,
  },
  followingText: {
    fontSize: 12.5,
    fontWeight: "400",
    color: SinoBrand.textSecondary,
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
    paddingTop: 24,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "400",
    color: SinoBrand.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
