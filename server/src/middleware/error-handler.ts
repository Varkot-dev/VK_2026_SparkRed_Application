import type { ApiError } from '@marquee/shared';
import type { NextFunction, Request, Response } from 'express';
import { AppError, NotFoundError } from '../lib/errors';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError('No such endpoint'));
}

/**
 * Single place that turns thrown errors into the API envelope.
 * Express 5 forwards rejected promises from async handlers here automatically.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const body: ApiError = { error: { code: err.code, message: err.message, ...(err.details !== undefined && { details: err.details }) } };
    return res.status(err.status).json(body);
  }

  // express.json() tags unparseable bodies with body-parser's error type.
  if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    const body: ApiError = { error: { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON' } };
    return res.status(400).json(body);
  }

  console.error('[unhandled]', err);
  const body: ApiError = { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side' } };
  return res.status(500).json(body);
}
