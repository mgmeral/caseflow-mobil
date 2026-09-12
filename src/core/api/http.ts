import { environment } from '../config/env';

export interface ApiFieldError {
  field?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: ApiFieldError[];
  correlationId?: string | null;

  constructor(status: number, code: string, message: string, details: ApiFieldError[] = [], correlationId?: string | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.correlationId = correlationId;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

function buildUrl(path: string) {
  const normalizedBase = environment.apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.Authorization = 'Bearer ' + options.token;
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const correlationId = response.headers.get('x-correlation-id');
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.code ?? 'REQUEST_FAILED',
      payload?.message ?? `Request failed with status ${response.status}`,
      payload?.details ?? [],
      correlationId,
    );
  }

  return (payload ?? undefined) as T;
}

export function getDisplayMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return 'Network error. Please check your connection.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'The request conflicts with current server state.';
      case 422:
        return error.message || 'The request could not be completed.';
      default:
        return error.message || 'Something went wrong.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

export { buildUrl };
