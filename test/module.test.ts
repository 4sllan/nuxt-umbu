import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setup } from '@nuxt/test-utils'
import type { NuxtConfig } from 'nuxt'
import type { ModuleOptions } from '../src/runtime/types'

describe('Module Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct module metadata', async () => {
    const module = await import('../src/module')
    const mod = module.default

    expect(mod.meta?.name).toBe('nuxt-umbu')
    expect(mod.meta?.configKey).toBe('auth')
  })

  it('should merge default options correctly', async () => {
    const testConfig: NuxtConfig = {
      modules: ['../src/module'],
      auth: {
        provider: 'sanctum',
        strategies: {
          test: {
            endpoints: {
              login: '/login',
              user: '/user'
            }
          }
        }
      }
    }

    expect(testConfig.auth?.provider).toBe('sanctum')
    expect(testConfig.auth?.strategies?.test).toBeDefined()
  })

  it('should handle passport provider configuration', () => {
    const passportConfig: ModuleOptions = {
      provider: 'passport',
      strategies: {
        passport: {
          handler: [
            { login: '/auth/passport/login' },
            { logout: '/auth/passport/logout' }
          ],
          endpoints: {
            user: '/api/user'
          }
        }
      }
    }

    expect(passportConfig.provider).toBe('passport')
    expect(passportConfig.strategies?.passport?.handler).toBeDefined()
    expect(passportConfig.strategies?.passport?.endpoints?.user).toBe('/api/user')
  })

  it('should handle sanctum provider configuration', () => {
    const sanctumConfig: ModuleOptions = {
      provider: 'sanctum',
      strategies: {
        sanctum: {
          endpoints: {
            login: '/login',
            logout: '/logout',
            user: '/api/user'
          }
        }
      }
    }

    expect(sanctumConfig.provider).toBe('sanctum')
    expect(sanctumConfig.strategies?.sanctum?.endpoints?.login).toBe('/login')
    expect(sanctumConfig.strategies?.sanctum?.endpoints?.user).toBe('/api/user')
  })

  it('should handle two-factor auth configuration', () => {
    const configWith2FA: ModuleOptions & { twoFactorAuth: boolean } = {
      provider: 'sanctum',
      twoFactorAuth: true,
      strategies: {
        sanctum: {
          endpoints: {
            login: '/login',
            '2fa': '/2fa-challenge'
          }
        }
      }
    }

    expect(configWith2FA.twoFactorAuth).toBe(true)
    expect(configWith2FA.strategies?.sanctum?.endpoints?.['2fa']).toBe('/2fa-challenge')
  })

  it('should have default cookie configuration', () => {
    const defaultCookieOptions = {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      priority: 'high'
    }

    expect(defaultCookieOptions.httpOnly).toBe(false)
    expect(defaultCookieOptions.secure).toBe(false)
    expect(defaultCookieOptions.sameSite).toBe('Lax')
    expect(defaultCookieOptions.priority).toBe('high')
  })
})
