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
      const { useCookie: mockUseCookie } = require('#imports')
      const { navigateTo: mockNavigateTo } = require('#imports')
      const { useRuntimeConfig: mockUseRuntimeConfig } = require('#imports')
      const { useAuthStore: mockUseAuthStore } = require('#imports')
      const { useAuthConfig: mockUseAuthConfig } = require('#imports')

      // Mock the dependencies
      const mockStore = {
        value: {
          user: null,
          loggedIn: false,
          strategy: ''
        }
      }
      mockUseAuthStore.mockReturnValue(mockStore)

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
      mockUseAuthConfig.mockReturnValue(mockConfig)

      const mockRuntimeConfig = {
        public: {
          baseURL: 'http://localhost:3000'
        }
      }
      mockUseRuntimeConfig.mockReturnValue(mockRuntimeConfig)

      // Import the real useUmbuUtils after mocking dependencies
      const { useUmbuUtils } = require('../src/runtime/utils/common')
      
      const utils = useUmbuUtils()

      expect(utils).toHaveProperty('getStrategyConfig')
      expect(utils).toHaveProperty('getRedirect')
      expect(utils).toHaveProperty('getEndpoint')
      expect(utils).toHaveProperty('extractUser')
      expect(utils).toHaveProperty('clearAuthData')
      expect(utils).toHaveProperty('handleRedirect')
      expect(utils).toHaveProperty('config')
      expect(utils).toHaveProperty('publicConfig')
      expect(utils).toHaveProperty('store')
    })

    describe('getStrategyConfig', () => {
      it('should return strategy configuration', () => {
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
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
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getStrategyConfig } = useUmbuUtils()

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
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
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
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getRedirect } = useUmbuUtils()

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
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
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
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getEndpoint } = useUmbuUtils()

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
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
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
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getEndpoint } = useUmbuUtils()

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
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
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
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getEndpoint } = useUmbuUtils()

        const loginEndpoint = getEndpoint('sanctum', 'login')
        const userEndpoint = getEndpoint('sanctum', 'user')

        expect(loginEndpoint).toEqual({ url: '/custom/login', method: 'POST' })
        expect(userEndpoint).toEqual({ url: '/custom/user', method: 'GET' })
      })

      it('should return null for non-existent strategy', () => {
        const { useAuthConfig: mockUseAuthConfig } = require('#imports')
        
        const mockConfig = {
          provider: 'sanctum',
          strategies: {}
        }
        mockUseAuthConfig.mockReturnValue(mockConfig)

        const { useUmbuUtils } = require('../src/runtime/utils/common')
        const { getEndpoint } = useUmbuUtils()

        const endpoint = getEndpoint('nonexistent', 'login')
        expect(endpoint).toBeNull()
      })
    })
  })
})
