import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../lib/errors';

type Schemas = { body?: ZodType; query?: ZodType; params?: ZodType };

/**
 * Validates and coerces request parts with zod. Parsed values land on
 * `res.locals.validated` because Express 5 makes `req.query` read-only.
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validated: Record<string, unknown> = {};
    for (const part of ['body', 'query', 'params'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
        return next(new ValidationError(details[0]?.message ?? 'Invalid request', details));
      }
      validated[part] = result.data;
    }
    res.locals.validated = validated;
    next();
  };
}

/** Typed accessor for values produced by `validate()`. */
export function validated<T extends { body?: unknown; query?: unknown; params?: unknown }>(res: Response): T {
  return (res.locals.validated ?? {}) as T;
}
