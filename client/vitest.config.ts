import { defineConfig } from 'vitest/config';

// Pure-logic tests only (query helpers, loaders); UI is verified in the browser.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
