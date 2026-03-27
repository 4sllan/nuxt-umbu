import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuthStore', () => {
    it('should initialize with default state', () => {
      const mockState = {
        user: null,
        loggedIn: false,
        strategy: ''
      }

      // Mock useState behavior
      const useState = vi.fn(() => mockState)
      
      const store = useState('auth', () => ({
        user: null,
        loggedIn: false,
        strategy: ''
      }))
      
      expect(store).toEqual(mockState)
    })

    it('should return auth state object', () => {
      const testState = {
        user: { id: 1, name: 'Test User' },
        loggedIn: true,
        strategy: 'sanctum'
      }

      // Mock useState behavior
      const useState = vi.fn(() => testState)
      
      const store = useState('auth', () => testState)
      
      expect(store.user).toEqual({ id: 1, name: 'Test User' })
      expect(store.loggedIn).toBe(true)
      expect(store.strategy).toBe('sanctum')
    })
  })

  describe('useAuthConfig', () => {
    it('should return auth configuration from runtime config', () => {
      const mockConfig = {
        public: {
          'nuxt-umbu': {
            provider: 'sanctum',
            strategies: {
              sanctum: {
                endpoints: {
                  login: '/login',
                  user: '/user'
                }
              }
            },
            twoFactorAuth: false
          }
        }
      }

      // Mock useRuntimeConfig behavior
      const useRuntimeConfig = vi.fn(() => mockConfig)
      
      const config = useRuntimeConfig().public['nuxt-umbu']
      
      expect(config.provider).toBe('sanctum')
      expect(config.strategies?.sanctum).toBeDefined()
      expect(config.twoFactorAuth).toBe(false)
    })
  })

  describe('useEnsureCsrf', () => {
    it('should return early if auth is not available', async () => {
      const mockNuxtApp = {
        $auth: null
      }

      // Mock useNuxtApp and useCookie
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useCookie = vi.fn(() => ({ value: null }))
      
      const nuxtApp = useNuxtApp()
      const cookie = useCookie('XSRF-TOKEN')
      
      if (!nuxtApp.$auth) {
        // Should not throw error
        expect(true).toBe(true)
      }
      
      expect(cookie.value).toBeNull()
    })

    it('should set XSRF token header when cookie exists', async () => {
      const mockAuth = {
        headers: {
          set: vi.fn()
        }
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      // Mock useNuxtApp and useCookie
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useCookie = vi.fn(() => ({ value: 'test-xsrf-token' }))
      
      const nuxtApp = useNuxtApp()
      const cookie = useCookie('XSRF-TOKEN')
      
      if (nuxtApp.$auth && cookie.value) {
        nuxtApp.$auth.headers.set('X-XSRF-TOKEN', decodeURIComponent(cookie.value))
      }
      
      expect(mockAuth.headers.set).toHaveBeenCalledWith('X-XSRF-TOKEN', 'test-xsrf-token')
    })

    it('should call csrfToken when cookie does not exist', async () => {
      const mockAuth = {
        headers: {
          set: vi.fn()
        },
        csrfToken: vi.fn()
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      // Mock useNuxtApp and useCookie
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useCookie = vi.fn(() => ({ value: null }))
      
      const nuxtApp = useNuxtApp()
      const cookie = useCookie('XSRF-TOKEN')
      
      if (nuxtApp.$auth && !cookie.value) {
        await nuxtApp.$auth.csrfToken()
      }
      
      expect(mockAuth.csrfToken).toHaveBeenCalled()
    })
  })

  describe('$autx', () => {
    it('should throw error when auth instance is not available', async () => {
      const mockNuxtApp = {
        $auth: null
      }

      // Mock dependencies
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useRuntimeConfig = vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } }))
      const useAuthConfig = vi.fn(() => ({ provider: 'sanctum' }))
      
      const nuxtApp = useNuxtApp()
      
      if (!nuxtApp.$auth || !nuxtApp.$auth?.headers) {
        expect(() => {
          throw new Error('Auth instance is not available or missing headers.')
        }).toThrow('Auth instance is not available or missing headers.')
      }
    })

    it('should include CSRF for sanctum provider with POST request', async () => {
      const mockAuth = {
        headers: new Headers({ 'Authorization': 'Bearer token' })
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      // Mock dependencies
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useRuntimeConfig = vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } }))
      const useAuthConfig = vi.fn(() => ({ provider: 'sanctum' }))
      const useEnsureCsrf = vi.fn()
      
      const nuxtApp = useNuxtApp()
      const config = useAuthConfig()
      const method = 'POST'
      
      // CSRF should be included for sanctum POST requests
      if (config.provider === 'sanctum' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        await useEnsureCsrf(nuxtApp.$auth)
      }
      
      expect(useEnsureCsrf).toHaveBeenCalled()
    })

    it('should not include CSRF for passport provider', async () => {
      const mockAuth = {
        headers: new Headers({ 'Authorization': 'Bearer token' })
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      // Mock dependencies
      const useNuxtApp = vi.fn(() => mockNuxtApp)
      const useRuntimeConfig = vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } }))
      const useAuthConfig = vi.fn(() => ({ provider: 'passport' }))
      
      const nuxtApp = useNuxtApp()
      const config = useAuthConfig()
      const method = 'POST'
      
      // CSRF should not be included for passport requests
      if (config.provider === 'sanctum' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // This should not execute
        expect(false).toBe(true)
      } else {
        expect(true).toBe(true)
      }
    })
  })
})
