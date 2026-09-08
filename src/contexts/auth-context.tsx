import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type UpdateResult = {
  error: string | null;
};

type AuthContextValue = {
  session: Session | null;
  /** Whether we already know the initial session state (vs. still checking AsyncStorage). */
  loading: boolean;
  /** A signed-in user still needs a display name before they can use the app. */
  isProfileComplete: boolean;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<UpdateResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateDisplayName(name: string): Promise<UpdateResult> {
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    return { error: error?.message ?? null };
  }

  const value: AuthContextValue = {
    session,
    loading,
    isProfileComplete: Boolean(session?.user.user_metadata?.full_name),
    signOut,
    updateDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
