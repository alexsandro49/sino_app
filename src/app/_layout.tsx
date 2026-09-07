import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // 1. Escuta mudanças na sessão (login, confirmação de token, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/homeScreen');
      }
    });

    // Função para processar links recebidos (deep links do Magic Link)
    const handleUrl = async (url: string) => {
      try {
        const parsed = Linking.parse(url);

        // Se for fluxo PKCE com ?code=...
        const code = parsed.queryParams?.code;
        if (typeof code === 'string') {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            router.replace('/homeScreen');
          }
          return;
        }

        // Se o Supabase retornou tokens no fragmento hash (#access_token=...&refresh_token=...)
        if (url.includes('#')) {
          const hash = url.split('#')[1];
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error) {
              router.replace('/homeScreen');
            }
          }
        }
      } catch (err) {
        console.error('Erro ao processar URL de autenticação:', err);
      }
    };

    // 2. Trata a URL que abriu o aplicativo inicialmente
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    // 3. Trata deep links quando o aplicativo já está aberto em background
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="signIn" />
    </ThemeProvider>
  );
}

