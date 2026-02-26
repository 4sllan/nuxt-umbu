// eslint.config.mjs
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    typescript: true,
  },
})
    // Regras gerais de JavaScript
    .override('nuxt/javascript', {
      rules: {
        curly: ['error', 'all'], // sempre usar {}
        'no-console': ['warn', { allow: ['warn', 'error'] }], // só warn, error e debug
        'prefer-const': ['error'], // prefira const
      },
    })
    // Regras de TypeScript
    .override('nuxt/typescript/rules', {
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-explicit-any': 'off', // desativa temporariamente any
      },
    })
    // Regras de Vue
    .override('nuxt/vue/rules', {
      rules: {
        'vue/multi-word-component-names': 'off', // ignora nome multi-word
        'vue/html-self-closing': 'off',
        'vue/attributes-order': 'off',
      },
    })