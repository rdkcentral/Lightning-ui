// @ts-check
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';

/**
 * Vite Config
 */
export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [dts()],
    build: {
      minify: false,
      sourcemap: true,
      lib: {
        entry: {
          index: './index.ts',
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: ['@lightningjs/core'],
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/vitest.setup.ts'],
      commandLine: 'npm test --',
    }
  }
})
