export const authTypesTemplate = (typesPath: string, utilsPath: string) => `
import type { Ref } from 'vue'
import type { AuthState, ModuleOptions } from '${typesPath}'

export interface NuxtAuth {
  /** Dados do usuário autenticado */
  readonly user: Record<string, unknown> | null;
  /** Estratégia ativa no momento */
  readonly strategy: string | null;
  /** Status de autenticação */
  readonly loggedIn: boolean;
  /** Headers de autenticação (reativos) */
  headers: Headers;
  /** Prefixo configurado para cookies/tokens */
  readonly prefix: string | null;
  
  getRedirect(strategyName: string): Record<string, string> | null;
  loginWith(strategyName: string, value: Record<string, unknown>): Promise<Record<string, unknown>>;
  logout(strategyName: string): Promise<void>;
  twoFactor(strategyName: string, code: string): Promise<{ success: boolean }>;
}

// Declaração do Alias de Utilitários
declare module '#auth-utils' {
  export * from '${utilsPath}'
}

// Declaração do Alias de Tipos Gerais
declare module '#auth-types' {
  export * from '${typesPath}'
}

declare module '#app' {
  interface NuxtApp {$auth: NuxtAuth}
}

declare module 'vue' {
  interface ComponentCustomProperties {$auth: NuxtAuth}
}

declare module '#imports' {
  /**
   * Fornece acesso às configurações do módulo nuxt-umbu.
   */
  export const useAuthConfig: () => ModuleOptions;
  
  /**
   * Composable utilitário para gerenciamento de estados internos da autenticação.
   */
  export const useAuthStore: () => Ref<AuthState>;

  /**
   * Helper para garantir a proteção CSRF antes de requisições sensíveis.
   */
  export const useEnsureCsrf: () => Promise<void>;

  /**
   * Instância estendida de fetch/utilitário para requisições autenticadas.
   */
  export const $autx: <T = unknown>(request: string, options?: Record<string, unknown>) => Promise<T>;
}

export {}
`.trim()