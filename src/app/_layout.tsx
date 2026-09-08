import { DefaultTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

SplashScreen.preventAutoHideAsync();

function AuthRouter() {
  const router = useRouter();
  const { session, loading, isProfileComplete } = useAuth();

  useEffect(() => {
    if (loading || !session) return;
    router.replace(isProfileComplete ? "/homeScreen" : "/collectName");
  }, [loading, session, isProfileComplete, router]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthRouter />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="signIn" />
      </ThemeProvider>
    </AuthProvider>
  );
}
