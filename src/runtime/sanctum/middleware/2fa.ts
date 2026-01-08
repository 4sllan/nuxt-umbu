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

    // Cookie httpOnly - somente SSR consegue ler
    const token = useCookie<string | null>(`token_2fa`).value;

    if (!validateSessionHas2FA(strategyName, token, null, true)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }
  }

  if (import.meta.client) {
    const token2FA = strategyName
      ? localStorage.getItem($auth.prefix + `_2fa.` + strategyName)
      : null;

    if (
      !validateSessionHas2FA(strategyName, token2FA, null, false) ||
      $auth.strategy !== strategyName ||
      $auth.strategy !== store.value.strategy
    ) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }

    if (!$auth.user || !$auth.loggedIn || !store.value.user || !store.value.loggedIn) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }
  }
});
