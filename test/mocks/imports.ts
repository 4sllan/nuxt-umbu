import { vi } from 'vitest'

// Mock Nuxt imports
export const useCookie = vi.fn()
export const useRuntimeConfig = vi.fn()
export const useAuthStore = vi.fn()
export const useAuthConfig = vi.fn()
export const useNuxtApp = vi.fn()
export const useRequestEvent = vi.fn()
export const defineNuxtRouteMiddleware = vi.fn((fn) => fn)
export const defineNuxtPlugin = vi.fn((fn) => fn)
export const navigateTo = vi.fn()
export const createError = vi.fn()
export const $fetch = vi.fn()
export const parseCookies = vi.fn()
export const syncHeaders = vi.fn()
