import {
  useNuxtApp,
  useCookie,
  useAuthStore,
  createError,
  useRequestEvent,
  defineNuxtRouteMiddleware,
} from '#imports';
import { handleLogout, validateSession, getRedirectPath } from '#auth-utils';

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
  const xsrf = useCookie<string | null>(`XSRF-TOKEN`).value;

  if (import.meta.server) {
    const event = useRequestEvent();
    if (!event) return;

    // Cookie httpOnly - somente SSR consegue ler
    const session = useCookie<string | null>(`laravel-session`).value;

    if (!validateSession(strategyName, session, xsrf, true)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }

    if (xsrf) {
      $auth.headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
    }
  }

  /* ======================================================
   *  CLIENT SIDE
   * ====================================================== */
  if (import.meta.client) {
    // Não passa session porque é httpOnly → sempre null no client
    if (!validateSession(strategyName, null, xsrf, false)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }

    if (xsrf) {
      $auth.headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
    }

    // Validação final do estado do auth no front
    if (!$auth.user || !$auth.loggedIn || !store.value.user || !store.value.loggedIn) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }
  }
});
