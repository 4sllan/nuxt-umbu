import type { ModuleOptions } from '#auth-types';
import { useRuntimeConfig } from '#imports';

export const useAuthConfig = (): ModuleOptions & { twoFactorAuth: boolean } => {
  return useRuntimeConfig().public['nuxt-umbu'] as ModuleOptions & { twoFactorAuth: boolean };
};
