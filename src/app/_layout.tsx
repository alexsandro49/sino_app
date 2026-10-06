import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { DefaultTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SinoBrand } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: SinoBrand.primary,
    background: SinoBrand.background,
    card: SinoBrand.background,
    text: SinoBrand.ink,
    border: SinoBrand.divider,
  },
};

function AuthRouter() {
  const router = useRouter();
  const { user, loading, isProfileComplete } = useAuth();

  useEffect(() => {
    if (loading) return;

    SplashScreen.hideAsync();

    if (!user) {
      router.replace("/signIn");
      return;
    }
    router.replace(isProfileComplete ? "/homeScreen" : "/collectName");
  }, [loading, user, isProfileComplete, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WatchlistProvider>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="dark" />
            <AuthRouter />
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: SinoBrand.background } }}
              initialRouteName="signIn"
            >
              <Stack.Screen
                name="addTicker"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: [0.92],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 22,
                  contentStyle: { backgroundColor: SinoBrand.white },
                }}
              />
              <Stack.Screen
                name="ticker/[symbol]"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: [0.88],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 22,
                  contentStyle: { backgroundColor: SinoBrand.white },
                }}
              />
            </Stack>
          </ThemeProvider>
        </WatchlistProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
