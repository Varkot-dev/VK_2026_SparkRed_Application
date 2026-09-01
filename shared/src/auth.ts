import { z } from 'zod';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt input limit

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
  .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters`)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`);

export const registerInput = z.object({
  username: usernameSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginInput>;

export type PublicUser = {
  id: number;
  username: string;
  createdAt: string;
};
