import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

/**
 * Bundles the Express app into one ESM file for the Vercel function.
 * Third-party packages stay external (Vercel traces them from node_modules);
 * the @marquee/shared workspace is inlined because it ships TypeScript source.
 */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const external = Object.keys(pkg.dependencies ?? {}).filter((name) => name !== '@marquee/shared');

await build({
  entryPoints: ['src/app.ts'],
  outfile: 'dist/app.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  external,
  logLevel: 'info',
});
