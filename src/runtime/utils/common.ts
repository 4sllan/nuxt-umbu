import { useCookie, navigateTo, useRuntimeConfig, useAuthStore, useAuthConfig } from '#imports'

export const useUmbuUtils = () => {
    const store = useAuthStore()
    const config = useAuthConfig() // Pega a configuração injetada no module.ts
    const publicConfig = useRuntimeConfig().public


    /**
     * Retorna a configuração de uma estratégia específica
     */
    const getStrategyConfig = (name: string) => config.strategies?.[name] || {}

    /**
     * Retorna os redirecionamentos de uma estratégia específica
     */
    const getRedirect = (strategyName: string): Record<string, string> | null => {
        return config.strategies?.[strategyName]?.redirect ?? null
    }

    /**
     * Resolve a URL e o Método de um endpoint (Passport vs Sanctum)
     */
    const getEndpoint = (strategyName: string, key: string): { url: string; method: string } | null => {
        const cfg = getStrategyConfig(strategyName);

        // --- Lógica Específica para Passport (Proxy vs Direct) ---
        if (Array.isArray(cfg.handler)) {
            // Se a chave for 'user', ignoramos o proxy e pegamos direto de 'endpoints.user'
            if (key === 'user') {
                const userEndpoint = cfg.endpoints?.user;
                if (!userEndpoint) return null;

                return typeof userEndpoint === 'string'
                    ? { url: userEndpoint, method: 'GET' }
                    : { url: userEndpoint.url, method: userEndpoint.method || 'GET' };
            }

            // Para login, logout, 2fa, etc., buscamos no array de handlers (Proxy)
            const route = cfg.handler.find((h: any) => h[key])?.[key];
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
     * Extrai o objeto do usuário baseado na propriedade configurada (ex: data.user)
     */
    const extractUser = (data: any, strategyName: string) => {
        const property = getStrategyConfig(strategyName).user?.property
        if (property && data && typeof data === 'object' && property in data) {
            return data[property]
        }
        return data
    }

    /**
     * Limpa cookies e localStorage relacionados ao prefixo do módulo
     */
    const clearAuthData = (prefix: string) => {
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
     * Gerencia o redirecionamento após ações de auth
     */
    const handleRedirect = async (strategyName: string, type: 'login' | 'logout') => {
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