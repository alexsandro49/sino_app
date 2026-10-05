import { DefaultTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";

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

export default function RootLayout() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <ThemeProvider value={DefaultTheme}>
          <AnimatedSplashOverlay />
          <AuthRouter />
          <Stack screenOptions={{ headerShown: false }} initialRouteName="signIn">
            <Stack.Screen name="addTicker" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}
