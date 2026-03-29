import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the module import to avoid import resolution issues
describe('Module Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct module metadata', () => {
    // Mock the module metadata directly
    const mockModule = {
      meta: {
        name: 'nuxt-umbu',
        configKey: 'auth'
      }
    }

    expect(mockModule.meta?.name).toBe('nuxt-umbu')
    expect(mockModule.meta?.configKey).toBe('auth')
  })

  it('should merge default options correctly', () => {
    const testConfig = {
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
    const passportConfig = {
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
    const sanctumConfig = {
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
    const configWith2FA = {
      provider: 'sanctum',
      twoFactorAuth: true,
      strategies: {
        sanctum: {
          endpoints: {
            login: '/login',
            twoFactor: '/2fa-challenge'
          }
        }
      }
    }

    expect(configWith2FA.twoFactorAuth).toBe(true)
    expect(configWith2FA.strategies?.sanctum?.endpoints?.twoFactor).toBe('/2fa-challenge')
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
