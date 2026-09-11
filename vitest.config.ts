import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: false,
    // Only run vitest suites. node:test files (backend/tests, backend/utils,
    // server/utils *.test.cjs) are run with `node --test`, not vitest.
    include: ['src/__tests__/**/*.test.{ts,tsx}', 'backend/__tests__/**/*.test.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'backend/tests/**',
      'backend/utils/**',
      'server/**',
      'scripts/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}', 'backend/**/*.js'],
      exclude: ['src/__tests__/**', 'src/main.tsx'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
