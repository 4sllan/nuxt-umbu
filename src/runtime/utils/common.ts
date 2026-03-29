import { useCookie, navigateTo, useRuntimeConfig, useAuthStore, useAuthConfig } from '#imports'

/**
 * Main utility composable for authentication management.
 * Provides access to authentication store, configuration, and helper functions.
 * @returns Object containing authentication utilities and state management functions
 */
export const useUmbuUtils = () => {
    const store = useAuthStore()
    const config = useAuthConfig() // Pega a configuração injetada no module.ts
    const publicConfig = useRuntimeConfig().public


    /**
     * Returns the configuration for a specific authentication strategy.
     * @param name - The name of the authentication strategy
     * @returns Strategy configuration object or empty object if not found
     */
    const getStrategyConfig = (name: string): Record<string, unknown> => config.strategies?.[name] || {}

    /**
     * Returns the redirect URLs for a specific authentication strategy.
     * @param strategyName - The name of the authentication strategy
     * @returns Object containing redirect URLs or null if strategy not found
     */
    const getRedirect = (strategyName: string): Record<string, string> | null => {
        return config.strategies?.[strategyName]?.redirect ?? null
    }

    /**
     * Resolves the URL and HTTP method for a specific authentication endpoint.
     * Handles both Passport (proxy/direct) and Sanctum (direct only) strategies.
     * @param strategyName - The name of the authentication strategy
     * @param key - The endpoint key (e.g., 'login', 'user', 'logout')
     * @returns Endpoint configuration with URL and method, or null if not found
     */
    const getEndpoint = (strategyName: string, key: string): { url: string; method: string } | null => {
        const cfg = getStrategyConfig(strategyName);

        // --- Lógica Específica para Passport (Proxy vs Direct) ---
        if (Array.isArray(cfg.handler)) {
            // Se a chave for 'user', ignoramos o proxy e pegamos direto de 'endpoints.user'
            if (key === 'user') {
                const userEndpoint = cfg.endpoints?.user as { url?: string; method?: string; property?: string } | undefined;
                if (!userEndpoint) return null;

                return typeof userEndpoint === 'string'
                    ? { url: userEndpoint, method: 'GET' }
                    : { url: userEndpoint.url, method: userEndpoint.method || 'GET' };
            }

            // Para login, logout, 2fa, etc., buscamos no array de handlers (Proxy)
            const route = cfg.handler.find((h: Record<string, string>) => h[key])?.[key];
            return route ? { url: route, method: 'POST' } : null;
        }

        // --- Lógica Específica para Sanctum (Direct Only) ---
        const endpoint = cfg.endpoints?.[key];
        if (!endpoint) return null;

        return typeof endpoint === 'string'
            ? { url: endpoint, method: key === 'login' || key === 'logout' ? 'POST' : 'GET' }
            : { url: endpoint.url, method: endpoint.method || 'POST' };
    };

    /**
     * Extracts user object from response data based on configured property.
     * @param data - The response data containing user information
     * @param strategyName - The name of the authentication strategy
     * @returns User object or raw data if no property is configured
     */
    const extractUser = (data: unknown, strategyName: string): unknown => {
        const property = (getStrategyConfig(strategyName).endpoints?.user as { url?: string; method?: string; property?: string } | undefined)?.property
        if (property && data && typeof data === 'object' && property in data) {
            return data[property]
        }
        return data
    }

    /**
     * Clears authentication data including cookies and localStorage.
     * Resets the auth store and removes all auth-related storage entries.
     * @param prefix - The prefix used for authentication cookies and storage keys
     */
    const clearAuthData = (prefix: string): void => {
        store.value = { user: null, loggedIn: false, strategy: '' }

        // Limpa cookies do Nuxt
        const strategyCookie = useCookie(`${prefix}strategy`)
        strategyCookie.value = undefined

        const xsrfCookie = useCookie('XSRF-TOKEN')
        xsrfCookie.value = undefined

        if (import.meta.client) {
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => localStorage.removeItem(key))
        }
    }

    /**
     * Manages redirection after authentication actions.
     * @param strategyName - The name of the authentication strategy
     * @param type - The type of action ('login' or 'logout')
     */
    const handleRedirect = async (strategyName: string, type: 'login' | 'logout'): Promise<void> => {
        const redirects = getRedirect(strategyName)
        const url = redirects?.[type] || (type === 'logout' ? '/' : null)
        if (url) await navigateTo(url)
    }

    return {
        config,
        publicConfig,
        store,
        getRedirect,
        getStrategyConfig,
        getEndpoint,
        extractUser,
        clearAuthData,
        handleRedirect
    }
}