import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^\.\.?\/_generated\/api$/, replacement: path.resolve(__dirname, 'convex/_generated/api.d.ts') },
      { find: /^\.\.?\/_generated\/dataModel$/, replacement: path.resolve(__dirname, 'convex/_generated/dataModel.d.ts') },
      { find: /^\.\.?\/_generated\/server$/, replacement: path.resolve(__dirname, 'convex/_generated/server.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results.json'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}'
      ]
    }
  }
});
