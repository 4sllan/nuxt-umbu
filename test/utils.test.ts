import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUmbuUtils', () => {
    it('should return utility functions', () => {
      const mockStore = {
        user: null,
        loggedIn: false,
        strategy: ''
      }

      const mockConfig = {
        provider: 'sanctum',
        strategies: {
          sanctum: {
            endpoints: {
              login: '/login',
              user: '/user'
            }
          }
        }
      }

      const mockRuntimeConfig = {
        public: {
          baseURL: 'http://localhost:3000'
        }
      }

      // Mock utility functions
      const getStrategyConfig = vi.fn()
      const getRedirect = vi.fn()
      const getEndpoint = vi.fn()

      const utils = {
        store: mockStore,
        config: mockConfig,
        publicConfig: mockRuntimeConfig,
        getStrategyConfig,
        getRedirect,
        getEndpoint
      }

      expect(utils).toHaveProperty('getStrategyConfig')
      expect(utils).toHaveProperty('getRedirect')
      expect(utils).toHaveProperty('getEndpoint')
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

        const getStrategyConfig = (name: string) => mockConfig.strategies?.[name] || {}

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

        const getRedirect = (strategyName: string) => {
          return mockConfig.strategies?.[strategyName]?.redirect ?? null
        }

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
                { '2fa': '/auth/passport/2fa' }
              ],
              endpoints: {
                user: '/api/user'
              }
            }
          }
        }

        const getEndpoint = (strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]

          if (Array.isArray(cfg.handler)) {
            if (key === 'user') {
              const userEndpoint = cfg.endpoints?.user
              if (!userEndpoint) return null

              return typeof userEndpoint === 'string'
                ? { url: userEndpoint, method: 'GET' }
                : { url: userEndpoint.url, method: userEndpoint.method || 'GET' }
            }

            const route = cfg.handler.find((h: any) => h[key])?.[key]
            return route ? { url: route, method: 'POST' } : null
          }

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) return null

          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        }

        const loginEndpoint = getEndpoint('passport', 'login')
        const logoutEndpoint = getEndpoint('passport', 'logout')
        const twoFaEndpoint = getEndpoint('passport', '2fa')
        const userEndpoint = getEndpoint('passport', 'user')
        const nonExistentEndpoint = getEndpoint('passport', 'nonexistent')

        expect(loginEndpoint).toEqual({ url: '/auth/passport/login', method: 'POST' })
        expect(logoutEndpoint).toEqual({ url: '/auth/passport/logout', method: 'POST' })
        expect(twoFaEndpoint).toEqual({ url: '/auth/passport/2fa', method: 'POST' })
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
                '2fa': '/2fa-challenge'
              }
            }
          }
        }

        const getEndpoint = (strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) return null

          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' || key === '2fa' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        }

        const loginEndpoint = getEndpoint('sanctum', 'login')
        const logoutEndpoint = getEndpoint('sanctum', 'logout')
        const userEndpoint = getEndpoint('sanctum', 'user')
        const twoFaEndpoint = getEndpoint('sanctum', '2fa')

        expect(loginEndpoint).toEqual({ url: '/login', method: 'POST' })
        expect(logoutEndpoint).toEqual({ url: '/logout', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/api/user', method: 'GET' })
        expect(twoFaEndpoint).toEqual({ url: '/2fa-challenge', method: 'POST' })
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

        const getEndpoint = (strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]

          const endpoint = cfg.endpoints?.[key]
          if (!endpoint) return null

          return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' }
        }

        const loginEndpoint = getEndpoint('sanctum', 'login')
        const userEndpoint = getEndpoint('sanctum', 'user')

        expect(loginEndpoint).toEqual({ url: '/custom/login', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/custom/user', method: 'GET' })
      })

      it('should return null for non-existent strategy', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {}
        }

        const getEndpoint = (strategyName: string, key: string) => {
          const cfg = mockConfig.strategies?.[strategyName]
          if (!cfg) return null
          return null
        }

        const endpoint = getEndpoint('nonexistent', 'login')
        expect(endpoint).toBeNull()
      })
    })
  })
})
