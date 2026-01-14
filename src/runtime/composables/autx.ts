import { $fetch, type FetchOptions, type FetchResponse, type FetchContext } from 'ofetch';
import { useNuxtApp, useRuntimeConfig, reloadNuxtApp, useAuthConfig, createError } from '#imports';
import type { AuthInstance } from '../types';
import { useEnsureCsrf } from '../composables/useEnsureCsrf';

export type AutxOptions<T = any> = FetchOptions<'json', T>;

const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function $autx<T = any>(request: string, options: AutxOptions<T> = {}): Promise<T> {
  const { $auth } = useNuxtApp() as unknown as { $auth: AuthInstance };
  const baseURL = useRuntimeConfig().public.baseURL as string | undefined;
  const { provider } = useAuthConfig();

  if (!$auth || !$auth.headers) {
    throw new Error('Auth instance is not available or missing headers.');
  }

  const method = (options.method || 'GET').toUpperCase();

  /**
   * CSRF SOMENTE PARA SANCTUM
   */

  if (provider === 'sanctum' && CSRF_METHODS.includes(method)) {
    await useEnsureCsrf($auth);
  }

  const authHeaders =
    $auth.headers instanceof Headers ? Object.fromEntries($auth.headers.entries()) : $auth.headers;

  const runtimeBaseURL = typeof baseURL === 'string' ? baseURL : undefined;

  const fetchOptions: AutxOptions<T> = {
    ...options,
    baseURL: options.baseURL ?? runtimeBaseURL,
    credentials: options.credentials ?? (provider === 'sanctum' ? 'include' : undefined),
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  return $fetch<T>(request, {
    ...fetchOptions,

    async onResponseError(context: FetchContext<T, 'json'> & { response: FetchResponse<T> }) {
      const { request, response } = context;
      let errorBody: any;
      try {
        errorBody = response._data ?? (await response.text());
      } catch (e) {
        errorBody = 'Unknown error';
      }

      console.error('[API Error]', {
        request,
        status: response.status,
        body: errorBody,
        fullResponse: response,
      });

      if (response.status === 401) {
        if (import.meta.client) {
          console.warn('[auth] 401 Unauthorized – reloading app');
          const strategy = $auth.strategy;

          if (strategy) {
            await $auth.logout(strategy);
          }
          if (provider === 'sanctum') {
            reloadNuxtApp();
          }
        }
        return;
      }

      throw createError({
        statusCode: response.status,
        data: errorBody,
      });
    },
  });
}
