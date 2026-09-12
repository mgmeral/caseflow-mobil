import { request } from './http';
import { refreshSession } from '../auth/session';
import { useSessionStore } from '../auth/sessionStore';

async function authenticatedRequest<T>(method: string, path: string, body?: unknown, allowRefresh = true) {
  const token = useSessionStore.getState().accessToken;

  try {
    return await request<T>(path, { method, body, token });
  } catch (error: any) {
    if (allowRefresh && error?.status === 401) {
      const nextToken = await refreshSession();
      if (nextToken) {
        return request<T>(path, { method, body, token: nextToken });
      }
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string) => authenticatedRequest<T>('GET', path),
  post: <T>(path: string, body?: unknown) => authenticatedRequest<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => authenticatedRequest<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => authenticatedRequest<T>('PATCH', path, body),
  delete: <T>(path: string) => authenticatedRequest<T>('DELETE', path),
};
