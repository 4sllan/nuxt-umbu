import {
  useAuthStore,
  useRequestEvent,
  defineNuxtRouteMiddleware,
} from '#imports';
import {
  handleLogout,
  validateSession,
  getRedirectPath,
  validateAuthPlugin,
  extractServerAuthData,
  extractClientAuthData,
  validateUserAuthState,
  validateStrategyConsistency
} from '#auth-utils';

export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = validateAuthPlugin();
  const store = useAuthStore();

  if (import.meta.server) {
    const event = useRequestEvent();
    if (!event) return;

    const { strategy, token, expires } = extractServerAuthData($auth, '2fa');

    if (!validateSession(strategy, token, expires)) {
      return await handleLogout(strategy, getRedirectPath(strategy), 'has2FA');
    }
  }

  if (import.meta.client) {
    const { strategy, token, expires } = extractClientAuthData($auth, '2fa');
    
    if (
      !validateSession(strategy, token, expires) ||
      !validateStrategyConsistency($auth, store, strategy || '')
    ) {
      return await handleLogout(strategy, getRedirectPath(strategy), 'has2FA');
    }

    if (!validateUserAuthState($auth, store)) {
      return await handleLogout(strategy, getRedirectPath(strategy), 'has2FA');
    }
  }
});