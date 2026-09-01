import type { ApiErrorCode } from '@marquee/shared';

/**
 * Base class for every error the API deliberately returns.
 * The error handler maps `status`/`code` straight onto the response envelope,
 * so throwing one of these from anywhere in a request is the whole error path.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'You need to be signed in to do that') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Already exists') {
    super(409, 'CONFLICT', message);
  }
}

export class UpstreamError extends AppError {
  constructor(message = 'An upstream service failed') {
    super(503, 'UPSTREAM_ERROR', message);
  }
}
