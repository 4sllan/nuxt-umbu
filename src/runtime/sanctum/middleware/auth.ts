import {
  useNuxtApp,
  useCookie,
  useAuthStore,
  defineNuxtRouteMiddleware,
} from '#imports';
import { 
  handleLogout, 
  validateSession, 
  getRedirectPath,
  validateAuthPlugin,
  getCurrentStrategy,
  setXSRFHeaders,
  getRequestEvent,
  validateClientAuthState
} from '#auth-utils';

export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = useNuxtApp();
  const store = useAuthStore();

  validateAuthPlugin($auth);

  const strategyName = getCurrentStrategy($auth);
  const xsrf = useCookie<string | null>(`XSRF-TOKEN`).value;

  if (import.meta.server) {
    const event = getRequestEvent();
    if (!event) return;

    const session = useCookie<string | null>(`laravel-session`).value;

    if (!validateSession(strategyName, session, xsrf, true)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }

    setXSRFHeaders($auth);
  }

  if (import.meta.client) {
    if (!validateSession(strategyName, null, xsrf, false)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }

    setXSRFHeaders($auth);

    if (!validateClientAuthState($auth, store)) {
      return await handleLogout(strategyName, getRedirectPath(strategyName), 'auth');
    }
  }
});
