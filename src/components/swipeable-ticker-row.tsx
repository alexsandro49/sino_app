import * as Haptics from "expo-haptics";
import { Trash2 } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import ReanimatedSwipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { TickerRow } from "@/components/ticker-row";
import { Text } from "@/components/ui/text";
import { SinoBrand, SinoFonts, SinoRadius } from "@/constants/theme";
import type { Quote, Ticker } from "@/services/market";

const ACTION_WIDTH = 92;

type SwipeableTickerRowProps = {
  ticker: Ticker;
  quote?: Quote;
  pending?: boolean;
  onPress: () => void;
  onRemove: () => void;
  onOpen: (methods: SwipeableMethods) => void;
};

function RemoveAction({ progress, onRemove }: { progress: SharedValue<number>; onRemove: () => void }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.6, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.7, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Deixar de seguir"
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      >
        <Trash2 size={19} strokeWidth={1.8} color={SinoBrand.white} />
        <Text variant="caption" tone="white" style={styles.actionLabel}>
          Remover
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function SwipeableTickerRow({ ticker, quote, pending, onPress, onRemove, onOpen }: SwipeableTickerRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  function remove() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeableRef.current?.close();
    onRemove();
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1.6}
      rightThreshold={ACTION_WIDTH / 2}
      overshootRight={false}
      dragOffsetFromRightEdge={12}
      containerStyle={styles.container}
      onSwipeableWillOpen={() => {
        Haptics.selectionAsync();
        if (swipeableRef.current) onOpen(swipeableRef.current);
      }}
      renderRightActions={(progress) => <RemoveAction progress={progress} onRemove={remove} />}
    >
      <TickerRow
        ticker={ticker}
        quote={quote}
        pending={pending}
        onPress={onPress}
        accessibilityActions={[{ name: "delete", label: "Deixar de seguir" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "delete") onRemove();
        }}
      />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  actionContainer: {
    width: ACTION_WIDTH,
    paddingLeft: 8,
  },
  action: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: SinoRadius.card,
    backgroundColor: SinoBrand.down,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionLabel: {
    fontFamily: SinoFonts.semibold,
  },
});
