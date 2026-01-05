import {
  defineNuxtPlugin,
  useRequestEvent,
  navigateTo,
  useAuthStore,
  useAuthConfig,
  useRuntimeConfig,
  useCookie,
} from '#imports';
import { parseCookies, setCookie } from 'h3';
import { $fetch } from 'ofetch';

import type { AuthState, ProfileResponse, AuthResponse, AuthInstance } from '../types';

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = useAuthStore();
  const config = useRuntimeConfig();

  class Auth implements AuthInstance {
    public $headers: Headers;
    private _state: AuthState = { user: null, loggedIn: false, strategy: '' };
    private _prefix: string;
    private readonly options: Record<string, any>;

    constructor(options: Record<string, any>) {
      this.$headers = new Headers();
      this._prefix = options.cookie.prefix;
      this.options = options;
    }

    get state(): AuthState {
      return this._state;
    }

    get user(): any | null {
      return this._state.user;
    }

    get strategy(): string | null {
      return this._state.strategy;
    }

    get loggedIn(): boolean {
      return this._state.loggedIn;
    }

    get headers(): Headers {
      return this.$headers;
    }

    get prefix(): string | null {
      return this._prefix;
    }

    set headers(headers: Headers) {
      this.$headers = headers;
    }

    set state(val: AuthState) {
      this._state = val;
    }

    public getRedirect(strategyName: string): Record<string, string> | null {
      return this.options.strategies?.[strategyName]?.redirect ?? null;
    }

    private getUserProperty(strategyName: string): string | null {
      return this.options.strategies?.[strategyName]?.user?.property ?? null;
    }

    private getHandler(strategyName: string, key: string): { url: string; method: string } | null {
      return this.options.strategies?.[strategyName]?.endpoints?.[key] ?? null;
    }

    protected hasValidProperty<T extends Record<string, any>, K extends keyof T>(
      obj: T | null | undefined,
      key: K | null | undefined
    ): obj is T & Record<K, NonNullable<T[K]>> {
      if (!obj || !key) return false;

      const value = obj[key];
      return value !== null && value !== undefined;
    }

    async initialize(): Promise<void> {
      try {
        let strategy: string | null = null;
        let session: string | null = null;
        let xsrf: string | null = null;

        if (import.meta.server) {
          const event = useRequestEvent();

          if (!event) {
            console.warn('No request event available. Skipping initialization.');
            return;
          }

          const cookies = parseCookies(event);
          strategy = cookies[this._prefix + `strategy`];
          session = cookies[`laravel-session`];
          xsrf = cookies[`XSRF-TOKEN`];
        } else {
          strategy = useCookie<string | null>(this._prefix + `strategy`).value;
          session = useCookie<string | null>(`laravel-session`).value;
          xsrf = useCookie<string | null>(`XSRF-TOKEN`).value;
        }

        if (!strategy || !session || !xsrf) {
          console.warn('No valid session found. Skipping profile fetch.');
          return;
        }

        this._state.strategy = strategy ?? null;
        this.$headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));

        const data = await this._setProfile(strategy);

        if (data) {
          const property = this.getUserProperty(this._state.strategy);
          const user = this.hasValidProperty(data, property as keyof ProfileResponse)
            ? data[property as keyof ProfileResponse]
            : (data ?? null);

          this._state = {
            user,
            loggedIn: true,
            strategy: strategy ?? null,
          };
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    }

    async loginWith(strategyName: string, value: any): Promise<any> {
      try {
        const csrf = await this.csrfToken();

        if (!csrf) {
          throw new Error('Could not initialize CSRF protection.');
        }

        const endpoint = this.getHandler(strategyName, 'login');
        if (!endpoint?.url || !endpoint?.method) {
          throw new Error(`Login endpoint missing for strategy: ${strategyName}`);
        }

        const headers =
          this.$headers instanceof Headers
            ? Object.fromEntries(this.$headers.entries())
            : this.$headers;

        await $fetch<AuthResponse>(endpoint.url, {
          baseURL: config.public.baseURL,
          credentials: 'include',
          method: endpoint.method || 'POST',
          body: value,
          headers,
        });

        useCookie(this._prefix + `strategy`).value = strategyName;

        this._state.strategy = strategyName ?? null;

        const data = await this._setProfile(strategyName);

        if (!data) {
          throw new Error('Failed to load user profile.');
        }

        const redirectUrl = this.getRedirect(strategyName)?.login;

        if (redirectUrl) {
          await navigateTo(redirectUrl);
        }

        return { success: true, user: this._state.user };
      } catch (error) {
        console.error('Login failed:', error);
        return Promise.reject(error);
      }
    }

    async logout(strategyName: string): Promise<void> {
      try {
        const endpoint = this.getHandler(strategyName, 'logout');
        if (!endpoint?.url || !endpoint?.method) {
          throw new Error('Logout endpoint not found');
        }

        const response = await $fetch<{ logout?: string }>(endpoint?.url, {
          method: endpoint?.method || 'POST',
          body: { strategyName },
        });

        this._state = {
          user: null,
          loggedIn: false,
          strategy: '',
        };
        store.value = this._state;

        localStorage.clear();

        const redirectUrl = this.getRedirect(strategyName)?.logout ?? '/';
        await navigateTo(redirectUrl);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    async _2fa(strategyName: string, code: string): Promise<{ success: boolean }> {
      try {
        if (!code) {
          throw new Error('2FA code is required');
        }

        const endpoint = this.getHandler(strategyName, '2fa');
        if (!endpoint?.url || !endpoint?.method) {
          throw new Error('2FA endpoint not found');
        }

        const response = await $fetch<{ token?: string; expires?: string }>(endpoint?.url, {
          method: endpoint?.method || 'POST',
          body: { strategyName, code },
        });

        if (!response?.token || !response?.expires) {
          throw new Error('Invalid 2FA response');
        }

        localStorage.setItem(this._prefix + '_2fa.' + strategyName, response.token);
        localStorage.setItem(this._prefix + '_2fa_expiration.' + strategyName, response.expires);

        const options = this.options.cookie.options || {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
        };

        const setToken2fa = useCookie(this._prefix + '_2fa.' + strategyName, options);
        const set2faExpiration = useCookie(
          this._prefix + '_2fa_expiration.' + strategyName,
          options
        );

        setToken2fa.value = response.token;
        set2faExpiration.value = response.expires;

        this.$headers.set('2fa', response.token);

        return { success: true };
      } catch (error) {
        console.error('2FA failed:', error);
        return Promise.reject(error);
      }
    }

    async csrfToken(event?: any): Promise<boolean> {
      try {
        const csrfEndpoint = this.options?.csrf;

        if (!csrfEndpoint) {
          return false;
        }

        await $fetch(csrfEndpoint, {
          baseURL: config.public.baseURL,
          credentials: 'include',
        });

        const xsrf = useCookie<string | null>(`XSRF-TOKEN`).value;

        if (!xsrf) {
          throw new Error('Invalid CSRF response: Missing token.');
        }

        this.$headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
        this.$headers.set('Accept', 'application/json');

        return true;
      } catch (error) {
        console.error('Error fetching CSRF token:', error instanceof Error ? error.message : error);
        return false;
      }
    }

    private async _setProfile(strategyName: string): Promise<ProfileResponse | false> {
      try {
        const endpoint = this.getHandler(strategyName, 'user');

        if (!endpoint?.url || !endpoint?.method) throw new Error('User endpoint not found');

        const headers =
          this.$headers instanceof Headers
            ? Object.fromEntries(this.$headers.entries())
            : this.$headers;

        const data = await $fetch<ProfileResponse>(endpoint.url, {
          baseURL: config.public.baseURL,
          credentials: 'include',
          method: endpoint.method,
          headers,
        });

        if (!data) return false;

        const property = this.getUserProperty(this._state.strategy);
        const user = this.hasValidProperty(data, property as keyof ProfileResponse)
          ? data[property as keyof ProfileResponse]
          : (data ?? null);

        store.value = {
          user,
          strategy: this._state.strategy ?? null,
          loggedIn: true,
        };

        this._state = store.value;

        return data;
      } catch (error: any) {
        throw createError({
          statusCode: error.statusCode,
          statusMessage: 'Access denied',
        });
      }
    }
  }

  const $auth = new Auth(useAuthConfig());
  await $auth.initialize();

  const exposed = Object.defineProperties(
    {},
    {
      state: { get: () => $auth.state },
      user: { get: () => $auth.user },
      strategy: { get: () => $auth.strategy },
      loggedIn: { get: () => $auth.loggedIn },
      headers: {
        get: () => $auth.headers,
        set: (headers: Headers) => {
          $auth.headers = headers;
        },
      },
      prefix: { get: () => $auth.prefix },
    }
  );

  exposed.getRedirect = (strategyName: string) => {
    return $auth.getRedirect?.(strategyName) ?? null;
  };

  exposed.loginWith = async (strategyName: string, value: any) => {
    return await $auth.loginWith(strategyName, value);
  };

  exposed.logout = async (strategyName: string) => {
    return await $auth.logout(strategyName);
  };

  exposed._2fa = async (strategyName: string, code: string) => {
    return await $auth._2fa(strategyName, code);
  };

  nuxtApp.provide('auth', exposed);
});
