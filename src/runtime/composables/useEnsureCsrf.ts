import { useCookie, useNuxtApp } from '#imports';
import type { AuthInstance } from '#auth-types';

export async function useEnsureCsrf(auth?: AuthInstance): Promise<void> {
  const nuxtApp = useNuxtApp();
  const $auth = auth ?? (('$auth' in nuxtApp) ? nuxtApp.$auth as AuthInstance : null);

  if (!$auth) return;

  const xsrf = useCookie<string | null>('XSRF-TOKEN').value;

  // Cookie já existe → só sincroniza header
  if (xsrf) {
    $auth.headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
    return;
  }

  // Não existe → solicita CSRF
  await $auth.csrfToken();
}
