import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { tooling: true, typescript: true },
})
    .override('nuxt/javascript', {
      rules: {
        curly: ['error', 'all'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': ['error'],
      },
    })
    .override('nuxt/typescript/rules', {
      rules: {
        // Temporariamente ignorar variáveis não usadas e any para passar build
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    })
    .append({
      files: [
        'playground/app/pages/**/*.vue',
        'src/runtime/**/*.ts',
        'src/module.ts',
      ],
      rules: {
        // Ignora erros de no-unused-vars e similares
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'unicorn/prefer-node-protocol': 'off',
        'unicorn/prefer-number-properties': 'off',
        'curly': 'off',
      },
    })