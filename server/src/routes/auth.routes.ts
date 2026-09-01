import { loginInput, registerInput, type LoginInput, type PublicUser, type RegisterInput } from '@marquee/shared';
import { Router, type Request } from 'express';
import { SESSION_COOKIE } from '../middleware/session';
import { validate, validated } from '../middleware/validate';
import type { AuthService } from '../services/auth.service';

/** Swap the session id on login so a pre-auth session can't be fixated. */
function establishSession(req: Request, user: PublicUser): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));
}

export function createAuthRouter(auth: AuthService) {
  const router = Router();

  router.post('/register', validate({ body: registerInput }), async (req, res) => {
    const { body } = validated<{ body: RegisterInput }>(res);
    const user = await auth.register(body);
    await establishSession(req, user);
    res.status(201).json({ data: user });
  });

  router.post('/login', validate({ body: loginInput }), async (req, res) => {
    const { body } = validated<{ body: LoginInput }>(res);
    const user = await auth.login(body);
    await establishSession(req, user);
    res.json({ data: user });
  });

  router.post('/logout', async (req, res) => {
    await destroySession(req);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });

  /** Signed-out is a normal answer here, not an error: 200 with `data: null`. */
  router.get('/me', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.json({ data: null });

    const user = await auth.getById(userId);
    if (!user) {
      // Account vanished underneath a live session (e.g. DB reset): drop the session.
      await destroySession(req);
      res.clearCookie(SESSION_COOKIE);
      return res.json({ data: null });
    }
    res.json({ data: user });
  });

  return router;
}
