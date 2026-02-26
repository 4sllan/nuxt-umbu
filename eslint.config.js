// eslint.config.js
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { tooling: true, typescript: true },
})
    .override('nuxt/javascript', {
      rules: {
        curly: ['error', 'all'], // obriga chaves em if/else, loops, etc.
        'no-console': ['warn', { allow: ['warn', 'error'] }], // apenas warn/error liberados
        'prefer-const': ['error'], // prefere const sempre que possível
      },
    })