import { createError, navigateTo, useNuxtApp } from '#imports';

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
 * @param session - The authentication token.
 * @param xsrf - Expiration timestamp of the token.
 * @returns `true` if the session is valid, otherwise `false`.
 */
export const validateSession = (
  strategy: string | null,
  session: string | null,
  xsrf: string | null,
  isServer: boolean
): boolean => {
  if (!strategy) return false; // precisa saber qual usuário (admin, client…)

  // SERVER-SIDE: consegue acessar httpOnly
  if (isServer) {
    if (!session) return false; // precisa do laravel-session
    if (!xsrf) return false;
    return true;
  }

  // CLIENT-SIDE: NÃO CONSEGUE LER laravel_session
  // então valida apenas o que é possível
  if (!xsrf) return false; // sanctum exige xsrf-token

  return true;
};

/**
 * Validates an authentication session based on token and expiration time.
 * @param strategy - The authentication strategy in use.
 * @param token - The authentication token.
 * @param expires - Expiration timestamp of the token.
 * @returns `true` if the session is valid, otherwise `false`.
 */
export const validateSessionHas2FA = (
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

  const { login, callback, home } = $auth.getRedirect(strategy) || {};
  return callback || home || login || '/';
};
