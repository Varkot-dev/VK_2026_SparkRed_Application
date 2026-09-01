import { isApiError, type ApiErrorCode } from '@marquee/shared';

/** Thrown for any non-2xx response so callers can branch on status/code. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { json?: unknown };

/**
 * Small fetch wrapper: JSON in, unwrapped `data` out, envelope errors thrown.
 * Same-origin cookies ride along automatically.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...init } = options;
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { Accept: 'application/json', ...(json !== undefined && { 'Content-Type': 'application/json' }), ...headers },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiClientError(0, 'UPSTREAM_ERROR', 'Could not reach the server. Check your connection.');
  }

  if (res.status === 204) return undefined as T;

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok || isApiError(body)) {
    if (isApiError(body)) throw new ApiClientError(res.status, body.error.code, body.error.message, body.error.details);
    throw new ApiClientError(res.status, 'INTERNAL_ERROR', `Unexpected response (${res.status})`);
  }
  return (body as { data: T }).data;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  return err instanceof Error ? err.message : fallback;
}
