import { createError, navigateTo, useNuxtApp, useCookie, useRequestEvent, useAuthStore } from '#imports';

/**
 * Handles user logout by clearing session data and redirecting.
 * @param strategy - The authentication strategy to log out from.
 * @param redirectPath - The path to redirect after logout.
 * @param middleware - The middleware type, defaults to "auth".
 * @throws An error if called on the server side.
 */
export const handleLogout = async (
  strategy: string | null,
  redirectPath: string,
  middleware: string = 'auth'
) => {
  const nuxtApp = useNuxtApp();
  const $auth = nuxtApp?.$auth;

  if (!$auth) {
    console.error('Auth plugin is not initialized.');
    return navigateTo(redirectPath);
  }

  if (strategy) {
    await $auth.logout(strategy);
  }

  if (import.meta.client) {
    sessionStorage.clear();

    return navigateTo(redirectPath);
  }

  throw createError({
    statusCode: 401,
    statusMessage:
      middleware === 'auth'
        ? 'You do not have permission to access this page.'
        : 'You do not have permission to access this page without two-factor authentication.',
  });
};

/**
 * Validates an authentication session based on token and expiration time.
 * @param strategy - The authentication strategy in use.
 * @param token - The authentication token.
 * @param expires - Expiration timestamp of the token.
 * @returns `true` if the session is valid, otherwise `false`.
 */
export const validateSession = (
  strategy: string | null,
  token: string | null,
  expires: string | null
): boolean => {
  if (!strategy || !token) return false;

  const expirationTime = expires ? Number(expires) : 0;
  return expirationTime > Date.now();
};

/**
 * Retrieves the appropriate redirect path based on the authentication strategy.
 * @param strategy - The authentication strategy in use.
 * @returns The redirect path for login, callback, or home, defaults to `/` if none is found.
 */
export const getRedirectPath = (strategy: string | null): string => {
  if (!strategy) return '/';

  const nuxtApp = useNuxtApp();
  const $auth = nuxtApp?.$auth;

  if (!$auth) {
    console.error('Auth plugin is not initialized.');
    return '/';
  }

  const { callback, home, login } = $auth.getRedirect(strategy) || {};
  return callback || home || login || '/';
};

/**
 * Validates that the auth plugin is initialized and returns the auth instance.
 * @throws An error if the auth plugin is not initialized.
 */
export const validateAuthPlugin = () => {
  const { $auth } = useNuxtApp();
  
  if (!$auth) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Auth plugin is not initialized',
    });
  }
  
  return { $auth };
};

/**
 * Extracts authentication data from cookies on the server side.
 * @param $auth - The auth instance.
 * @param tokenSuffix - The token suffix (e.g., 'token', '2fa').
 * @returns Object containing strategy, token, and expiration.
 */
export const extractServerAuthData = ($auth: any, tokenSuffix: string) => {
  const strategyName = useCookie<string | null>($auth.prefix + `strategy`).value;
  const token = strategyName
    ? useCookie<string | null>($auth.prefix + `_${tokenSuffix}.` + strategyName).value
    : null;
  const expires = strategyName
    ? useCookie<string | null>($auth.prefix + `_${tokenSuffix}_expiration.` + strategyName).value
    : null;

  return { strategy: strategyName, token, expires };
};

/**
 * Extracts authentication data from localStorage on the client side.
 * @param $auth - The auth instance.
 * @param tokenSuffix - The token suffix (e.g., 'token', '2fa').
 * @returns Object containing strategy, token, and expiration.
 */
export const extractClientAuthData = ($auth: any, tokenSuffix: string) => {
  const strategy = localStorage.getItem($auth.prefix + `strategy`);
  const token = strategy ? localStorage.getItem($auth.prefix + `_${tokenSuffix}.` + strategy) : null;
  const expires = strategy
    ? localStorage.getItem($auth.prefix + `_${tokenSuffix}_expiration.` + strategy)
    : null;

  return { strategy, token, expires };
};

/**
 * Validates user authentication state on the client side.
 * @param $auth - The auth instance.
 * @param store - The auth store instance.
 * @returns True if user is authenticated, false otherwise.
 */
export const validateUserAuthState = ($auth: any, store: any) => {
  return !!(
    $auth.user &&
    $auth.loggedIn &&
    store.value.user &&
    store.value.loggedIn
  );
};

/**
 * Validates strategy consistency between auth and store.
 * @param $auth - The auth instance.
 * @param store - The auth store instance.
 * @param currentStrategy - The current strategy being validated.
 * @returns True if strategies are consistent, false otherwise.
 */
export const validateStrategyConsistency = ($auth: any, store: any, currentStrategy: string) => {
  return $auth.strategy === currentStrategy && $auth.strategy === store.value.strategy;
};
