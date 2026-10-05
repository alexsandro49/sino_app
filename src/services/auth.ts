import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { firebaseAuth, firebaseConfig } from "@/lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export type AppUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AuthResult = {
  error: string | null;
};

function toAppUser(user: User): AppUser {
  return {
    id: user.uid,
    name: user.displayName,
    email: user.email,
  };
}

export function subscribeToUser(listener: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, (user) => listener(user ? toAppUser(user) : null));
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const redirectUrl = Linking.createURL("/");
  const signInPage = `https://${firebaseConfig.authDomain}/google-sign-in.html`;
  const result = await WebBrowser.openAuthSessionAsync(
    `${signInPage}?redirect=${encodeURIComponent(redirectUrl)}`,
    redirectUrl,
  );

  if (result.type !== "success") {
    return { error: null };
  }

  const { queryParams } = Linking.parse(result.url);
  const idToken = queryParams?.id_token;

  if (typeof idToken !== "string") {
    const errorCode = queryParams?.error;
    return { error: typeof errorCode === "string" ? errorCode : "Resposta inválida do Google." };
  }

  await signInWithCredential(firebaseAuth, GoogleAuthProvider.credential(idToken));
  return { error: null };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}

export async function updateDisplayName(name: string): Promise<AppUser> {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new Error("Nenhum usuário autenticado.");
  }

  await updateProfile(user, { displayName: name });
  return toAppUser(user);
}

export async function getIdToken(): Promise<string> {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return user.getIdToken();
}
