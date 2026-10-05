import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import * as authService from "@/services/auth";
import type { AppUser, AuthResult } from "@/services/auth";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  isProfileComplete: boolean;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return authService.subscribeToUser((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
  }, []);

  async function updateDisplayName(name: string): Promise<AuthResult> {
    try {
      setUser(await authService.updateDisplayName(name));
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Não foi possível salvar o nome." };
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    isProfileComplete: Boolean(user?.name),
    signInWithGoogle: authService.signInWithGoogle,
    signOut: authService.signOut,
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
