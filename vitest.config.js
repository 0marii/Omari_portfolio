import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['games/tests/**/*.test.js'],
    environment: 'node',
  },
});
