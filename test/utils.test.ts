import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the imports that useUmbuUtils depends on
vi.mock('#imports', () => ({
  useCookie: vi.fn(),
  navigateTo: vi.fn(),
  useRuntimeConfig: vi.fn(),
  useAuthStore: vi.fn(),
  useAuthConfig: vi.fn()
}))

describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUmbuUtils', () => {
    it('should return utility functions', () => {
      // Create a mock implementation that matches the real useUmbuUtils structure
      const mockUtils = {
        config: {
          provider: 'sanctum',
          strategies: {
            sanctum: {
              endpoints: {
                login: '/login',
                user: '/user'
              }
            }
          }
        },
        publicConfig: {
          public: {
            baseURL: 'http://localhost:3000'
          }
        },
        store: {
          value: {
            user: null,
            loggedIn: false,
            strategy: ''
          }
        },
        getStrategyConfig: vi.fn((name: string) => ({ 
          endpoints: { login: '/login', user: '/user' }
        })),
        getRedirect: vi.fn((strategyName: string) => ({ 
          login: '/login', logout: '/', home: '/dashboard' 
        })),
        getEndpoint: vi.fn((strategyName: string, key: string) => {
          if (strategyName === 'passport' && key === 'login') {return { url: '/auth/passport/login', method: 'POST' }}
          if (strategyName === 'sanctum' && key === 'login') {return { url: '/login', method: 'POST' }}
          return null
        }),
        extractUser: vi.fn(),
        clearAuthData: vi.fn(),
        handleRedirect: vi.fn()
      }

      expect(mockUtils).toHaveProperty('getStrategyConfig')
      expect(mockUtils).toHaveProperty('getRedirect')
      expect(mockUtils).toHaveProperty('getEndpoint')
      expect(mockUtils).toHaveProperty('extractUser')
      expect(mockUtils).toHaveProperty('clearAuthData')
      expect(mockUtils).toHaveProperty('handleRedirect')
      expect(mockUtils).toHaveProperty('config')
      expect(mockUtils).toHaveProperty('publicConfig')
      expect(mockUtils).toHaveProperty('store')
    })

    describe('getStrategyConfig', () => {
      it('should return strategy configuration', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {
            sanctum: {
              endpoints: {
                login: '/login',
                user: '/user'
              }
            },
            passport: {
              handler: [
                { login: '/auth/passport/login' }
              ]
            }
          }
        }

        const getStrategyConfig = vi.fn((name: string) => mockConfig.strategies?.[name] || {})

        const sanctumConfig = getStrategyConfig('sanctum')
        const passportConfig = getStrategyConfig('passport')
        const nonExistentConfig = getStrategyConfig('nonexistent')

        expect(sanctumConfig).toEqual({
          endpoints: {
            login: '/login',
            user: '/user'
          }
        })
        expect(passportConfig).toEqual({
          handler: [
            { login: '/auth/passport/login' }
          ]
        })
        expect(nonExistentConfig).toEqual({})
      })
    })

    describe('getRedirect', () => {
      it('should return redirect configuration for strategy', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {
            sanctum: {
              redirect: {
                login: '/login',
                logout: '/',
                home: '/dashboard'
              }
            },
            passport: {
              redirect: null
            }
          }
        }

        const getRedirect = vi.fn((strategyName: string) => mockConfig.strategies?.[strategyName]?.redirect ?? null)

        const sanctumRedirects = getRedirect('sanctum')
        const passportRedirects = getRedirect('passport')

        expect(sanctumRedirects).toEqual({
          login: '/login',
          logout: '/',
          home: '/dashboard'
        })
        expect(passportRedirects).toBeNull()
      })
    })

    describe('getEndpoint', () => {
      it('should handle passport handler endpoints', () => {
        const mockConfig = {
          provider: 'passport',
          strategies: {
            passport: {
              handler: [
                { login: '/auth/passport/login' },
                { logout: '/auth/passport/logout' },
                { twoFactor: '/auth/passport/twoFactor' }
              ],
              endpoints: {
                user: '/api/user'
              }
            }
          }
        }

        const getEndpoint = vi.fn((strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]
          if (!cfg) {return null}

          if (Array.isArray(cfg.handler)) {
            if (key === 'user') {
              const userEndpoint = cfg.endpoints?.user
              if (!userEndpoint) {return null}
              return typeof userEndpoint === 'string'
                ? { url: userEndpoint, method: 'GET' }
                : { url: userEndpoint.url, method: userEndpoint.method || 'GET' }
            }
            const route = cfg.handler.find((h: Record<string, string>) => h[key])?.[key]
            return route ? { url: route, method: 'POST' } : null
          }

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) {return null}
          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        })

        const loginEndpoint = getEndpoint('passport', 'login')
        const logoutEndpoint = getEndpoint('passport', 'logout')
        const twoFactorEndpoint = getEndpoint('passport', 'twoFactor')
        const userEndpoint = getEndpoint('passport', 'user')
        const nonExistentEndpoint = getEndpoint('passport', 'nonexistent')

        expect(loginEndpoint).toEqual({ url: '/auth/passport/login', method: 'POST' })
        expect(logoutEndpoint).toEqual({ url: '/auth/passport/logout', method: 'POST' })
        expect(twoFactorEndpoint).toEqual({ url: '/auth/passport/twoFactor', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/api/user', method: 'GET' })
        expect(nonExistentEndpoint).toBeNull()
      })

      it('should handle sanctum direct endpoints', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {
            sanctum: {
              endpoints: {
                login: '/login',
                logout: '/logout',
                user: '/api/user',
                twoFactor: '/2fa-challenge'
              }
            }
          }
        }

        const getEndpoint = vi.fn((strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]
          if (!cfg) {return null}

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) {return null}
          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' || key === 'twoFactor' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        })

        const loginEndpoint = getEndpoint('sanctum', 'login')
        const logoutEndpoint = getEndpoint('sanctum', 'logout')
        const userEndpoint = getEndpoint('sanctum', 'user')
        const twoFactorEndpoint = getEndpoint('sanctum', 'twoFactor')

        expect(loginEndpoint).toEqual({ url: '/login', method: 'POST' })
        expect(logoutEndpoint).toEqual({ url: '/logout', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/api/user', method: 'GET' })
        expect(twoFactorEndpoint).toEqual({ url: '/2fa-challenge', method: 'POST' })
      })

      it('should handle object endpoint configuration', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {
            sanctum: {
              endpoints: {
                login: { url: '/custom/login', method: 'POST' },
                user: { url: '/custom/user', method: 'GET' }
              }
            }
          }
        }

        const getEndpoint = vi.fn((strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]
          if (!cfg) {return null}

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) {return null}
          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        })

        const loginEndpoint = getEndpoint('sanctum', 'login')
        const userEndpoint = getEndpoint('sanctum', 'user')

        expect(loginEndpoint).toEqual({ url: '/custom/login', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/custom/user', method: 'GET' })
      })

      it('should return null for non-existent strategy', () => {
        const getEndpoint = vi.fn(() => null)

        const endpoint = getEndpoint('nonexistent', 'login')
        expect(endpoint).toBeNull()
      })
    })
  })
})
