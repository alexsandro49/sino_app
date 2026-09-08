import { getQueryParams } from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "github";

type SignInResult = {
  error: string | null;
};

/**
 * Runs the full OAuth round-trip for a given provider: opens the provider's
 * consent screen in a system browser session, parses the redirect it comes
 * back with, and establishes the Supabase session from it.
 *
 * Uses WebBrowser.openAuthSessionAsync rather than a global deep-link
 * listener — the result is scoped to the session this call opened, so it
 * can't be triggered by an arbitrary incoming URL the way a generic
 * `Linking.addEventListener` handler could.
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<SignInResult> {
  const redirectTo = Linking.createURL("/");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error || !data?.url) {
    return { error: error?.message ?? "Tente novamente." };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    return { error: null };
  }

  const { params, errorCode } = getQueryParams(result.url);

  if (errorCode) {
    return { error: errorCode };
  }

  const { access_token, refresh_token } = params;

  if (!access_token || !refresh_token) {
    return { error: "Resposta inválida do provedor." };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  return { error: sessionError?.message ?? null };
}
