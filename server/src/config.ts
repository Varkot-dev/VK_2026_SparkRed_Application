import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().startsWith('postgres'),
  TMDB_READ_TOKEN: z.string().min(20, 'TMDB_READ_TOKEN looks too short to be a read access token'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
});

export type Config = z.infer<typeof envSchema> & { isProduction: boolean };

/** Parse and validate process.env once; fail fast with a readable message on misconfiguration. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return { ...parsed.data, isProduction: parsed.data.NODE_ENV === 'production' };
}
