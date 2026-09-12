import { loginRequest, logoutRequest, meRequest, refreshRequest } from './authApi';
import { useSessionStore } from './sessionStore';

let refreshInFlight: Promise<string | null> | null = null;

export async function login(username: string, password: string) {
  const tokens = await loginRequest(username, password);
  const user = await meRequest(tokens.accessToken);
  useSessionStore.getState().setSession(tokens, user);
}

export async function logout() {
  const refreshToken = useSessionStore.getState().refreshToken;

  try {
    if (refreshToken) {
      await logoutRequest(refreshToken);
    }
  } finally {
    useSessionStore.getState().clearSession();
  }
}

export async function restoreSession() {
  const { accessToken, refreshToken } = useSessionStore.getState();

  if (!refreshToken) {
    useSessionStore.getState().clearSession();
    return;
  }

  if (accessToken) {
    try {
      const user = await meRequest(accessToken);
      useSessionStore.getState().setUser(user);
      return;
    } catch {
      // continue with refresh path
    }
  }

  const nextToken = await refreshSession();
  if (!nextToken) {
    useSessionStore.getState().clearSession();
  }
}

export async function refreshSession() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const state = useSessionStore.getState();
    if (!state.refreshToken) {
      state.clearSession();
      return null;
    }

    try {
      const tokens = await refreshRequest(state.refreshToken);
      const user = await meRequest(tokens.accessToken);
      useSessionStore.getState().setSession(tokens, user);
      return tokens.accessToken;
    } catch {
      useSessionStore.getState().clearSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
