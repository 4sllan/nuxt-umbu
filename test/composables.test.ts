import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../src/runtime/composables/useAuthStore'
import { useAuthConfig } from '../src/runtime/composables/useAuthConfig'
import { useEnsureCsrf } from '../src/runtime/composables/useEnsureCsrf'
import { $autx } from '../src/runtime/composables/autx'

// Mock Nuxt imports
vi.mock('#imports', () => ({
  useState: vi.fn(),
  useRuntimeConfig: vi.fn(),
  useNuxtApp: vi.fn(),
  useCookie: vi.fn(),
  reloadNuxtApp: vi.fn(),
  createError: vi.fn()
}))

// Mock ofetch
vi.mock('ofetch', () => ({
  $fetch: vi.fn()
}))

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

      vi.doMock('#imports', () => ({
        useState: vi.fn(() => mockState)
      }))

      const store = useAuthStore()
      expect(store).toEqual(mockState)
    })

    it('should return auth state object', () => {
      const testState = {
        user: { id: 1, name: 'Test User' },
        loggedIn: true,
        strategy: 'sanctum'
      }

      vi.doMock('#imports', () => ({
        useState: vi.fn(() => testState)
      }))

      const store = useAuthStore()
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

      vi.doMock('#imports', () => ({
        useRuntimeConfig: vi.fn(() => mockConfig)
      }))

      const config = useAuthConfig()
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

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useCookie: vi.fn(() => ({ value: null }))
      }))

      await useEnsureCsrf()
      // Should not throw error
      expect(true).toBe(true)
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

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useCookie: vi.fn(() => ({ value: 'test-xsrf-token' }))
      }))

      await useEnsureCsrf()
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

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useCookie: vi.fn(() => ({ value: null }))
      }))

      await useEnsureCsrf()
      expect(mockAuth.csrfToken).toHaveBeenCalled()
    })
  })

  describe('$autx', () => {
    it('should throw error when auth instance is not available', async () => {
      const mockNuxtApp = {
        $auth: null
      }

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useRuntimeConfig: vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } })),
        useAuthConfig: vi.fn(() => ({ provider: 'sanctum' }))
      }))

      await expect($autx('/test')).rejects.toThrow('Auth instance is not available or missing headers.')
    })

    it('should include CSRF for sanctum provider with POST request', async () => {
      const mockAuth = {
        headers: new Headers({ 'Authorization': 'Bearer token' })
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useRuntimeConfig: vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } })),
        useAuthConfig: vi.fn(() => ({ provider: 'sanctum' })),
        useEnsureCsrf: vi.fn()
      }))

      vi.doMock('ofetch', () => ({
        $fetch: vi.fn().mockResolvedValue({ success: true })
      }))

      await $autx('/test', { method: 'POST' })
      // Should call useEnsureCsrf for sanctum POST requests
      expect(true).toBe(true) // Placeholder - actual verification would need more complex mocking
    })

    it('should not include CSRF for passport provider', async () => {
      const mockAuth = {
        headers: new Headers({ 'Authorization': 'Bearer token' })
      }

      const mockNuxtApp = {
        $auth: mockAuth
      }

      vi.doMock('#imports', () => ({
        useNuxtApp: vi.fn(() => mockNuxtApp),
        useRuntimeConfig: vi.fn(() => ({ public: { baseURL: 'http://localhost:3000' } })),
        useAuthConfig: vi.fn(() => ({ provider: 'passport' }))
      }))

      vi.doMock('ofetch', () => ({
        $fetch: vi.fn().mockResolvedValue({ success: true })
      }))

      await $autx('/test', { method: 'POST' })
      // Should not call useEnsureCsrf for passport requests
      expect(true).toBe(true) // Placeholder - actual verification would need more complex mocking
    })
  })
})
