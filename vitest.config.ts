import { defineConfig } from 'vitest/config'
import { join } from 'node:path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Resolve imports de Nuxt 4 dentro da lib
      '#imports': join(__dirname, 'src'),       // composables e helpers
      '#runtime': join(__dirname, 'src/runtime'), // runtime do módulo
      '#modules': join(__dirname, 'src/module.ts'), // módulo principal
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom', // ambiente leve para testes de Vue/Nuxt
    include: ['src/**/*.test.ts'], // testa apenas arquivos da lib
    exclude: ['playground/**', 'test/e2e/**'], // ignora playground e e2e
    setupFiles: join(__dirname, 'test/setup.ts'), // mocks globais opcionais
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['playground/**', 'test/**'],
    },
  },
})