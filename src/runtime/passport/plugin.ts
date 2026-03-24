import {
    defineNuxtPlugin,
    useRequestEvent,
    useUmbuUtils,
    createError,
} from '#imports';
import {parseCookies} from 'h3';
import {$fetch} from 'ofetch';

import type {ProfileResponse, AuthResponse} from '#auth-types';

export default defineNuxtPlugin(async (nuxtApp) => {
    const {
        store,
        config,
        getRedirect,
        publicConfig,
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
    const fetchProfile = async (strategyName: string, token?: string): Promise<ProfileResponse | null> => {
        const endpoint = getEndpoint(strategyName, 'user');

        if (!endpoint?.url) return null;

        if (token) {
            $headers.set('Authorization', token);
        }

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
    const _2fa = async (strategyName: string, code: string) => {
        const endpoint = getEndpoint(strategyName, '2fa');
        if (!endpoint?.url) throw new Error('2FA endpoint not found');

        const response = await $fetch<{ token?: string }>(endpoint.url, {
            method: endpoint.method || 'POST',
            body: {strategyName, code},
        });

        if (response?.token) {
            $headers.set('2fa', response.token);
            if (import.meta.client) {
                localStorage.setItem(`${prefix}_2fa.${strategyName}`, response.token);
            }
        }

        return {success: !!response?.token};
    };

    // --- Inicialização Automática ---
    let strategy: string | null = null;
    let token: string | null = null;

    if (import.meta.server) {
        const event = useRequestEvent();
        if (event) {
            const cookies = parseCookies(event);
            strategy = cookies[`${prefix}strategy`];
            token = strategy ? cookies[`${prefix}_token.${strategy}`] : null;
        }
    } else {
        strategy = localStorage.getItem(`${prefix}strategy`);
        token = strategy ? localStorage.getItem(`${prefix}_token.${strategy}`) : null;
    }

    if (strategy && token) {
        await fetchProfile(strategy, token).catch(() => {
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
        _2fa,
        fetchProfile
    };

    nuxtApp.provide('auth', auth);
});