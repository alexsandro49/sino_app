import {
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const hasName = Boolean(session.user.user_metadata?.full_name);
          router.replace(hasName ? "/homeScreen" : "/collectName");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="signIn" />
    </ThemeProvider>
  );
}
