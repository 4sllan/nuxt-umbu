import {
  useNuxtApp,
  useCookie,
  useAuthStore,
  defineNuxtRouteMiddleware,
} from '#imports';
import { 
  handleLogout, 
  getRedirectPath, 
  validateSessionHas2FA,
  validateAuthPlugin,
  getCurrentStrategy,
  getRequestEvent,
  validateClientAuthState
} from '#auth-utils';

export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = useNuxtApp();
  const store = useAuthStore();

  validateAuthPlugin($auth);

  const strategyName = getCurrentStrategy($auth);

  if (import.meta.server) {
    const event = getRequestEvent();
    if (!event) {
      // Fail closed - if we can't get the request event, treat as unauthorized
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }

    const token = strategyName
      ? useCookie<string | null>($auth.prefix + `_2fa.` + strategyName).value
      : null;

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

    if (!validateClientAuthState($auth, store)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'has2FA');
    }
  }
});
