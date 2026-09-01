import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) return next(new UnauthorizedError());
  next();
}

/** Only valid after `requireAuth`; throws rather than returning undefined so misuse is loud. */
export function currentUserId(req: Request): number {
  const id = req.session.userId;
  if (!id) throw new UnauthorizedError();
  return id;
}
