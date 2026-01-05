import {
  useNuxtApp,
  useCookie,
  useAuthStore,
  createError,
  useRequestEvent,
  defineNuxtRouteMiddleware,
} from '#imports';
import { handleLogout, getRedirectPath, validateSessionHas2FA } from '#auth-utils';

export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = useNuxtApp();
  const store = useAuthStore();

  if (!$auth) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Auth plugin is not initialized',
    });
  }

  // Sempre acessíveis no server e client
  const strategyName = useCookie<string | null>($auth.prefix + `strategy`).value;

  if (import.meta.server) {
    const event = useRequestEvent();
    if (!event) return;

    const token = strategyName
      ? useCookie<string | null>($auth.prefix + `_2fa.` + strategyName).value
      : null;
    const expires = strategyName
      ? useCookie<string | null>($auth.prefix + `_2fa_expiration.` + strategyName).value
      : null;

    if (!validateSessionHas2FA(strategyName, token, expires)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }

    if (token) {
      $auth.headers.set('2fa', token);
    }
  }

  if (import.meta.client) {
    const strategy = localStorage.getItem($auth.prefix + `strategy`);
    const token = strategy ? localStorage.getItem($auth.prefix + `_2fa.` + strategy) : null;
    const expires = strategy
      ? localStorage.getItem($auth.prefix + `_2fa_expiration.` + strategy)
      : null;
    //
    if (
      !validateSessionHas2FA(strategy, token, expires) ||
      $auth.strategy !== strategy ||
      $auth.strategy !== store.value.strategy
    ) {
      return await handleLogout(strategy, getRedirectPath(strategy), 'has2FA');
    }

    if (token) {
      $auth.headers.set('2fa', token);
    }

    if (!$auth.user || !$auth.loggedIn || !store.value.user || !store.value.loggedIn) {
      return await handleLogout(strategy, getRedirectPath(strategy), 'has2FA');
    }
  }
});
