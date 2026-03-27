import { defineConfig } from 'vitest/config'
import { join } from 'node:path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Resolve imports de Nuxt 4 dentro da lib
      '#imports': join(__dirname, 'test/mocks/imports.ts'),
      '#runtime': join(__dirname, 'src/runtime'),
      '#modules': join(__dirname, 'src/module.ts'),
      '#auth-utils': join(__dirname, 'test/mocks/auth-utils.ts'),
      '#auth-types': join(__dirname, 'src/templates/auth-types.ts')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom', // ambiente leve para testes de Vue/Nuxt
    include: ['test/**/*.test.ts'], // apenas arquivos de teste da lib
    exclude: ['playground/**', 'test/e2e/**', 'dist/**'], // ignora playground, testes e2e e dist
    testTimeout: 10000, // timeout aumentado para testes mais complexos
    hookTimeout: 10000, // timeout para hooks
    isolate: true, // isola testes para evitar contaminação
    setupFiles: [], // arquivos de setup global se necessário
    sequence: {
      shuffle: false, // mantém ordem determinística
      concurrent: true, // permite execução paralela
    },
    coverage: {
      "provider": "istanbul",
      "all": true,
      "reporter": [
            "text",
            "lcov",
            "html",
            "json"
      ],
      "reportsDirectory": "./coverage",
      "exclude": [
            "playground/**",
            "test/**",
            "test-results/**",
            "dist/**",
            "docs/**",
            "scripts/**",
            ".github/**",
            "src/runtime/types/**",
            "src/templates/**",
            "**/*.d.ts",
            "**/*.config.*",
            "**/node_modules/**",
            "**/*.spec.ts"
      ],
      "include": [
            "src/**"
      ],
      "thresholds": {
            "lines": 80,
            "functions": 80,
            "branches": 80,
            "statements": 80,
            "perFile": true,
            "src/**/*.ts": {
              "lines": 70,
              "functions": 70,
              "branches": 70,
              "statements": 70
            }
      }
    },
    // Configurações de output para melhor debugging
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json'
    },
    // Mock globals para Nuxt
    globalSetup: [],
    // Environment variables para testes
    env: {
      NODE_ENV: 'test'
    }
  }
})