import {
    defineNuxtPlugin,
    useRequestEvent,
    useUmbuUtils,
    createError,
} from '#imports';
import {parseCookies} from 'h3';
import {$fetch} from 'ofetch';
import {syncHeaders} from '#auth-utils';

import type {ProfileResponse, AuthResponse} from '#auth-types';

export default defineNuxtPlugin(async (nuxtApp) => {
    const {
        store,
        config,
        getRedirect,
        publicConfig,
        getStrategyConfig,
        getEndpoint,
        extractUser,
        clearAuthData,
        handleRedirect
    } = useUmbuUtils();

    const prefix = config.cookie.prefix;
    const $headers = new Headers();

    /**
     * Busca o perfil do usuário e atualiza o estado global
     */
    const fetchProfile = async (strategyName: string, token?: string, t2fa?: string): Promise<ProfileResponse | null> => {
        const endpoint = getEndpoint(strategyName, 'user');

        if (!endpoint?.url) return null;

        // Sincroniza os headers antes da chamada
        syncHeaders($headers, token, t2fa, config, getStrategyConfig(strategyName));

        try {
            const data = await $fetch<ProfileResponse>(endpoint.url, {
                baseURL: publicConfig.baseURL,
                method: endpoint.method || 'GET',
                headers: {
                    ...Object.fromEntries($headers.entries()),
                    'Content-Type': 'application/json',
                },
            });

            store.value = {
                user: extractUser(data, strategyName),
                strategy: strategyName,
                loggedIn: true,
            };

            return data;
        } catch (error: any) {
            clearAuthData(prefix);
            throw createError({
                statusCode: error.statusCode || 401,
                statusMessage: 'Access denied',
            });
        }
    };

    /**
     * Realiza o login via Passport (OAuth2 Grant)
     */
    const loginWith = async (strategyName: string, credentials: any) => {
        const endpoint = getEndpoint(strategyName, 'login');
        if (!endpoint?.url) throw new Error(`Login endpoint missing for: ${strategyName}`);

        const response = await $fetch<AuthResponse>(endpoint.url, {
            method: endpoint.method || 'POST',
            body: {strategyName, value: credentials},
        });

        if (!response.token) throw new Error('Token is missing in the response');

        if (import.meta.client) {
            localStorage.setItem(`${prefix}_token.${strategyName}`, response.token);
            localStorage.setItem(`${prefix}strategy`, strategyName);
            if (response.expires) {
                localStorage.setItem(`${prefix}_token_expiration.${strategyName}`, response.expires);
            }
        }

        await fetchProfile(strategyName, response.token);
        await handleRedirect(strategyName, 'login');


        return response;
    };

    /**
     * Encerra a sessão e limpa os dados locais
     */
    const logout = async (strategyName: string) => {
        const endpoint = getEndpoint(strategyName, 'logout');

        if (endpoint?.url) {
            await $fetch(endpoint.url, {
                method: endpoint.method || 'POST',
                body: {strategyName}
            }).catch(() => {
            });
        }

        clearAuthData(prefix);
        await handleRedirect(strategyName, 'logout');
    };

    /**
     * Fluxo de Segundo Fator de Autenticação
     */
    const twoFactor = async (strategyName: string, code: string) => {
        const endpoint = getEndpoint(strategyName, 'twoFactor');
        if (!endpoint?.url) throw new Error('Two Factor Auth endpoint not found');

        const response = await $fetch<{ token?: string, expires?: string }>(endpoint.url, {
            method: endpoint.method || 'POST',
            body: {strategyName, code},
        });

        if (!response?.token || !response?.expires) {
            throw new Error('Invalid Two Factor Auth response');
        }

        syncHeaders($headers, null, response.token, config, getStrategyConfig(strategyName));
        if (import.meta.client) {
            localStorage.setItem(`${prefix}_2fa.${strategyName}`, response.token);
            localStorage.setItem(`${prefix}_2fa_expiration.${strategyName}`, response.expires);
        }

        return {success: !!response?.token};
    };

    // --- Inicialização Automática ---
    let strategy: string | null = null;
    let token: string | null = null;
    let t2fa: string | null = null;

    if (import.meta.server) {
        const event = useRequestEvent();
        if (event) {
            const cookies = parseCookies(event);
            strategy = cookies[`${prefix}strategy`] || null;
            token = strategy ? (cookies[`${prefix}_token.${strategy}`] ?? null) : null;
            t2fa = strategy ? (cookies[`${prefix}_2fa.${strategy}`] ?? null) : null;
        }
    } else {
        strategy = localStorage.getItem(`${prefix}strategy`);
        token = strategy ? localStorage.getItem(`${prefix}_token.${strategy}`) : null;
        t2fa = strategy ? localStorage.getItem(`${prefix}_2fa.${strategy}`) : null;
    }

    if (strategy && token) {
        await fetchProfile(strategy, token, t2fa).catch(() => {
            console.warn('[Umbu-Passport] Session expired or invalid.');
        });
    }

    // Interface Reativa Exposta
    const auth = {
        get user() {
            return store.value.user
        },
        get loggedIn() {
            return store.value.loggedIn
        },
        get strategy() {
            return store.value.strategy
        },
        get headers() {
            return $headers
        },
        get prefix() {
            return prefix
        },

        getRedirect,
        loginWith,
        logout,
        twoFactor,
        fetchProfile
    };

    nuxtApp.provide('auth', auth);
});