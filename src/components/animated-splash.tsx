import * as Haptics from "expo-haptics";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { SinoMark } from "@/components/sino-mark";
import { Text } from "@/components/ui/text";
import { SinoBrand } from "@/constants/theme";

const MARK_SIZE = 72;
const MARK_HEIGHT = MARK_SIZE * 0.935;
const WAVE_SIZE = 132;
const RING_DELAY = 180;
const INTRO_DURATION = 1300;
const REDUCED_INTRO_DURATION = 450;

const swingEasing = Easing.inOut(Easing.quad);

function SoundWave({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.32 * (1 - progress.value),
    transform: [{ scale: 0.5 + progress.value * 0.9 }],
  }));

  return <Animated.View style={[styles.wave, style]} />;
}

type AnimatedSplashProps = {
  ready: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ ready, onFinish }: AnimatedSplashProps) {
  const reduceMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const started = useRef(false);

  const swing = useSharedValue(0);
  const firstWave = useSharedValue(0);
  const secondWave = useSharedValue(0);
  const wordmark = useSharedValue(0);
  const exit = useSharedValue(0);

  function start() {
    if (started.current) return;
    started.current = true;
    SplashScreen.hideAsync();

    if (!reduceMotion) {
      swing.value = withDelay(
        RING_DELAY,
        withSequence(
          withTiming(-14, { duration: 130, easing: Easing.out(Easing.quad) }),
          withTiming(11, { duration: 180, easing: swingEasing }),
          withTiming(-7, { duration: 160, easing: swingEasing }),
          withTiming(3.5, { duration: 140, easing: swingEasing }),
          withTiming(0, { duration: 130, easing: swingEasing }),
        ),
      );
      firstWave.value = withDelay(RING_DELAY + 40, withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }));
      secondWave.value = withDelay(RING_DELAY + 360, withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }));
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft), RING_DELAY);
    }

    wordmark.value = withDelay(
      reduceMotion ? 0 : 340,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );

    setTimeout(() => setIntroDone(true), reduceMotion ? REDUCED_INTRO_DURATION : INTRO_DURATION);
  }

  useEffect(() => {
    if (!ready || !introDone) return;

    exit.value = withTiming(1, { duration: 280, easing: Easing.inOut(Easing.quad) }, (finished) => {
      if (finished) scheduleOnRN(onFinish);
    });
  }, [ready, introDone, exit, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
  }));

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + exit.value * 0.08 }, { rotate: `${swing.value}deg` }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: (1 - wordmark.value) * 10 }],
  }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      onLayout={start}
      pointerEvents={introDone && ready ? "none" : "auto"}
      accessibilityLabel="Sino"
      accessibilityRole="image"
    >
      <View style={styles.waves}>
        <SoundWave progress={firstWave} />
        <SoundWave progress={secondWave} />
      </View>

      <Animated.View style={[styles.mark, markStyle]}>
        <SinoMark size={MARK_SIZE} />
      </Animated.View>

      <Animated.View style={[styles.wordmark, wordmarkStyle]}>
        <Text variant="display">Sino</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SinoBrand.background,
  },
  mark: {
    transformOrigin: "50% 0%",
  },
  waves: {
    position: "absolute",
    width: WAVE_SIZE,
    height: WAVE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -MARK_HEIGHT / 2 + MARK_SIZE / 4 }],
  },
  wave: {
    position: "absolute",
    width: WAVE_SIZE,
    height: WAVE_SIZE,
    borderRadius: WAVE_SIZE / 2,
    borderWidth: 2,
    borderColor: SinoBrand.primary,
  },
  wordmark: {
    position: "absolute",
    top: "50%",
    marginTop: MARK_HEIGHT / 2 + 18,
  },
});
