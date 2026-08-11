import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
  },
  resolve: {
    alias: {
      'nitropack/runtime/config': fileURLToPath(new URL('./test/mocks/nitropack-runtime.ts', import.meta.url)),
    },
  },
})
