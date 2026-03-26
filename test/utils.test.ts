import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUmbuUtils } from '../src/runtime/utils/common'

// Mock Nuxt imports
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

      vi.doMock('#imports', () => ({
        useAuthStore: vi.fn(() => mockStore),
        useAuthConfig: vi.fn(() => mockConfig),
        useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
        useCookie: vi.fn(),
        navigateTo: vi.fn()
      }))

      const utils = useUmbuUtils()
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

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        const sanctumConfig = utils.getStrategyConfig('sanctum')
        const passportConfig = utils.getStrategyConfig('passport')
        const nonExistentConfig = utils.getStrategyConfig('nonexistent')

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

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        const sanctumRedirects = utils.getRedirect('sanctum')
        const passportRedirects = utils.getRedirect('passport')

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

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        
        const loginEndpoint = utils.getEndpoint('passport', 'login')
        const logoutEndpoint = utils.getEndpoint('passport', 'logout')
        const twoFaEndpoint = utils.getEndpoint('passport', '2fa')
        const userEndpoint = utils.getEndpoint('passport', 'user')
        const nonExistentEndpoint = utils.getEndpoint('passport', 'nonexistent')

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

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        
        const loginEndpoint = utils.getEndpoint('sanctum', 'login')
        const logoutEndpoint = utils.getEndpoint('sanctum', 'logout')
        const userEndpoint = utils.getEndpoint('sanctum', 'user')
        const twoFaEndpoint = utils.getEndpoint('sanctum', '2fa')

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

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        
        const loginEndpoint = utils.getEndpoint('sanctum', 'login')
        const userEndpoint = utils.getEndpoint('sanctum', 'user')

        expect(loginEndpoint).toEqual({ url: '/custom/login', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/custom/user', method: 'GET' })
      })

      it('should return null for non-existent strategy', () => {
        const mockConfig = {
          provider: 'sanctum',
          strategies: {}
        }

        vi.doMock('#imports', () => ({
          useAuthStore: vi.fn(() => ({})),
          useAuthConfig: vi.fn(() => mockConfig),
          useRuntimeConfig: vi.fn(() => ({ public: {} })),
          useCookie: vi.fn(),
          navigateTo: vi.fn()
        }))

        const utils = useUmbuUtils()
        const endpoint = utils.getEndpoint('nonexistent', 'login')

        expect(endpoint).toBeNull()
      })
    })
  })
})
