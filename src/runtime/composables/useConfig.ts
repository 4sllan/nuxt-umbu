import type { ModuleOptions } from '../types';
import { useRuntimeConfig } from '#imports';

export const useAuthConfig = (): ModuleOptions & { twoFactorAuth: boolean } => {
  return useRuntimeConfig().public['nuxt-umbu'] as ModuleOptions & { twoFactorAuth: boolean };
};
