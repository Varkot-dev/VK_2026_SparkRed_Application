import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs from server/, but secrets live in the repo-root .env.
try {
  process.loadEnvFile('../.env');
} catch {
  // No local .env (e.g. CI) — rely on the real environment.
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
