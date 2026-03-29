import {
    defineNuxtPlugin,
    useRequestEvent,
    useCookie,
    useUmbuUtils,
    createError,
    $autx,
} from '#imports';
import { parseCookies } from 'h3';
import { $fetch } from 'ofetch';

import type { ProfileResponse, AuthResponse } from '#auth-types';

export default defineNuxtPlugin(async (nuxtApp) => {
    const {
        store,
        config,
        publicConfig,
        getEndpoint,
        extractUser,
        clearAuthData,
        handleRedirect,
        getRedirect
    } = useUmbuUtils();

    const prefix = config.cookie.prefix;
    const $headers = new Headers();

    /**
     * Inicializa a proteção CSRF do Sanctum
     */
    const csrfToken = async (): Promise<boolean> => {
        if (import.meta.server) return false;

        const csrfEndpoint = config.csrf;
        if (!csrfEndpoint) return false;

        try {
            await $fetch(csrfEndpoint, {
                baseURL: publicConfig.baseURL,
                credentials: 'include',
            });

            const xsrf = useCookie<string | null>('XSRF-TOKEN').value;
            if (!xsrf) throw new Error('Invalid CSRF response: Missing token.');

            $headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
            $headers.set('Accept', 'application/json');

            return true;
        } catch (error) {
            console.error('[Umbu-Sanctum] CSRF Error:', error instanceof Error ? error.message : error);
            return false;
        }
    };

    /**
     * Busca o perfil do usuário (Sanctum usa cookies/sessão)
     */
    const fetchProfile = async (strategyName: string): Promise<ProfileResponse | null> => {
        const endpoint = getEndpoint(strategyName, 'user');
        if (!endpoint?.url) return null;

        try {
            const fetchOptions: any = {
                method: endpoint.method,
            };

            // On server, forward incoming cookies to maintain session
            if (import.meta.server) {
                const event = useRequestEvent();
                if (event) {
                    const cookies = parseCookies(event as any);
                    const cookieHeader = Object.entries(cookies)
                        .map(([key, value]) => `${key}=${value}`)
                        .join('; ');
                    fetchOptions.headers = {
                        'Cookie': cookieHeader,
                    };
                }
            }

            const data = await $autx<ProfileResponse>(endpoint.url, fetchOptions);

            store.value = {
                user: extractUser(data, strategyName),
                strategy: strategyName,
                loggedIn: true,
            };

            return data;
        } catch (error: any) {
            throw createError({
                statusCode: error.statusCode || 401,
                statusMessage: 'Access denied',
            });
        }
    };

    /**
     * Login Sanctum: Primeiro garante o CSRF, depois autentica
     */
    const loginWith = async (strategyName: string, value: any) => {
        const xsrf = useCookie<string | null>('XSRF-TOKEN').value;

        if (!xsrf) {
            const ok = await csrfToken();
            if (!ok) throw new Error('Could not initialize CSRF protection.');
        }

        const endpoint = getEndpoint(strategyName, 'login');
        if (!endpoint?.url) throw new Error(`Login endpoint missing: ${strategyName}`);

        await $autx<AuthResponse>(endpoint.url, {
            method: endpoint.method || 'POST',
            body: value,
        });

        useCookie(`${prefix}strategy`).value = strategyName;
        const user = await fetchProfile(strategyName);

        await handleRedirect(strategyName, 'login');
        return { success: true, user };
    };

    /**
     * Logout Sanctum
     */
    const logout = async (strategyName: string) => {
        const endpoint = getEndpoint(strategyName, 'logout');

        try {
            if (endpoint?.url) {
                await $fetch(endpoint.url, {
                    baseURL: publicConfig.baseURL,
                    credentials: 'include',
                    method: endpoint.method || 'POST',
                    headers: Object.fromEntries($headers.entries()),
                    body: { strategyName },
                });
            }
        } catch (error) {
            console.error('[Umbu-Sanctum] Logout failed:', error);
        } finally {
            // Clear authentication headers
            $headers.delete('X-XSRF-TOKEN');
            $headers.delete('Accept');
            
            clearAuthData(prefix);
            await handleRedirect(strategyName, 'logout');
        }
    };

    /**
     * Segundo fator de autenticação para Sanctum
     */
    const twoFactor = async (strategyName: string, code: string) => {
        const endpoint = getEndpoint(strategyName, '2fa');
        if (!endpoint?.url) throw new Error('2FA endpoint not found');

        await $autx(endpoint.url, {
            method: endpoint.method || 'POST',
            body: { strategyName, code },
        });

        useCookie(`${prefix}strategy`).value = strategyName;
        const user = await fetchProfile(strategyName);
        await handleRedirect(strategyName, 'login');
        return { success: true, user };
    };

    // --- Inicialização da Sessão ---
    let strategy: string | null = null;
    let xsrf: string | null = null;

    if (import.meta.server) {
        const event = useRequestEvent();
        if (event) {
            const cookies = parseCookies(event as any);
            strategy = cookies[`${prefix}strategy`] ?? null;
            xsrf = cookies['XSRF-TOKEN'] ?? null;
        }
    } else {
        strategy = useCookie<string | null>(`${prefix}strategy`).value;
        xsrf = useCookie<string | null>('XSRF-TOKEN').value;
    }

    if (xsrf) {
        $headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
    }

    if (strategy && xsrf) {
        await fetchProfile(strategy).catch(() => {
            console.warn('[Umbu-Sanctum] Session invalid on init.');
        });
    } else {
        // Tenta obter o token CSRF preventivamente se estiver no cliente
        await csrfToken().catch(() => {});
    }

    // Interface Reativa
    const auth = {
        get user() { return store.value.user },
        get loggedIn() { return store.value.loggedIn },
        get strategy() { return store.value.strategy },
        get headers() { return $headers },
        get prefix() { return prefix },
        getRedirect,
        loginWith,
        logout,
        twoFactor,
        csrfToken,
        fetchProfile
    };

    nuxtApp.provide('auth', auth);
});