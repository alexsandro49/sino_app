import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, type Theme } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AnimatedSplash } from "@/components/animated-splash";
import { NotificationRouter } from "@/components/notification-router";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";
import { useColors } from "@/hooks/use-colors";

SplashScreen.preventAutoHideAsync();

function AuthRouter() {
  const router = useRouter();
  const { user, loading, isProfileComplete } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/signIn");
      return;
    }
    router.replace(isProfileComplete ? "/homeScreen" : "/collectName");
  }, [loading, user, isProfileComplete, router]);

  return null;
}

function SplashGate() {
  const { loading } = useAuth();
  const [visible, setVisible] = useState(true);
  const hide = useCallback(() => setVisible(false), []);

  return visible ? <AnimatedSplash ready={!loading} onFinish={hide} /> : null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });
  const scheme = useColorScheme();
  const colors = useColors();

  const navigationTheme = useMemo<Theme>(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primaryText,
        background: colors.background,
        card: colors.background,
        text: colors.ink,
        border: colors.divider,
      },
    };
  }, [scheme, colors]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WatchlistProvider>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="auto" />
            <AuthRouter />
            <NotificationRouter />
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
              initialRouteName="signIn"
            >
              <Stack.Screen
                name="addTicker"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: [0.92],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 22,
                  contentStyle: { backgroundColor: colors.surface },
                }}
              />
              <Stack.Screen
                name="ticker/[symbol]"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: [0.88],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 22,
                  contentStyle: { backgroundColor: colors.surface },
                }}
              />
            </Stack>
            <SplashGate />
          </ThemeProvider>
        </WatchlistProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
