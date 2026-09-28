import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthMeResponse, TokenResponse } from '../../types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  isHydrated: boolean;
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  user: AuthMeResponse | null;
  biometricEnabled: boolean;
  finishHydration: () => void;
  setSession: (tokens: TokenResponse, user: AuthMeResponse) => void;
  setUser: (user: AuthMeResponse) => void;
  clearSession: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
}

// expo-secure-store has no web implementation (every call throws), so the web
// target keeps the session in localStorage, as caseflow-fe does.
const storage = createJSONStorage<SessionState>(() => (Platform.OS === 'web'
  ? window.localStorage
  : {
    getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
    setItem: async (name, value) => {
      await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name) => {
      await SecureStore.deleteItemAsync(name);
    },
  }));

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      status: 'loading',
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      expiresIn: null,
      user: null,
      biometricEnabled: false,
      finishHydration: () => {
        const hasSession = Boolean(get().refreshToken);
        set({
          isHydrated: true,
          status: hasSession ? (get().user ? 'authenticated' : 'loading') : 'unauthenticated',
        });
      },
      setSession: (tokens, user) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        user,
        status: 'authenticated',
      }),
      setUser: (user) => set({ user, status: 'authenticated' }),
      clearSession: () => set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        user: null,
        status: 'unauthenticated',
      }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
    }),
    {
      name: 'caseflow-mobile-session',
      storage: storage as any,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        expiresIn: state.expiresIn,
        user: state.user,
        biometricEnabled: state.biometricEnabled,
      }),
      // On a storage error `state` is undefined; still finish hydration (as signed out)
      // rather than leaving the app on its loading spinner forever.
      onRehydrateStorage: () => (state) => {
        (state ?? useSessionStore.getState()).finishHydration();
      },
    },
  ),
);
