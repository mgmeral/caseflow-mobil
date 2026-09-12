import { request } from '../api/http';
import type { AuthMeResponse, TokenResponse } from '../../types/api';

export function loginRequest(username: string, password: string) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function refreshRequest(refreshToken: string) {
  return request<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function logoutRequest(refreshToken: string) {
  return request<void>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function meRequest(accessToken: string) {
  return request<AuthMeResponse>('/auth/me', {
    token: accessToken,
  });
}
