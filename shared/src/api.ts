/** Every API response is one of these two envelopes. */
export type ApiSuccess<T> = { data: T };

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UPSTREAM_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type ApiError = {
  error: { code: ApiErrorCode; message: string; details?: unknown };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'error' in value;
}
