import { vi } from 'vitest'

// Mock utilities for auth-utils
export const handleLogout = vi.fn()
export const validateSession = vi.fn()
export const getRedirectPath = vi.fn()
export const validateAuthPlugin = vi.fn()
export const extractServerAuthData = vi.fn()
export const extractClientAuthData = vi.fn()
export const validateUserAuthState = vi.fn()
export const validateStrategyConsistency = vi.fn()
export const csrfToken = vi.fn()
export const setXSRFHeaders = vi.fn()
export const getEndpoint = vi.fn()
export const extractUser = vi.fn()
export const clearAuthData = vi.fn()
export const handleRedirect = vi.fn()
export const useUmbuUtils = vi.fn()
