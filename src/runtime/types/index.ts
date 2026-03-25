import type { PassportModuleOptions } from './providers/passport';
import type { SanctumModuleOptions } from './providers/sanctum';
import type { AuthState } from './core/state';

// Configurações do módulo de autenticação
export type ModuleOptions = PassportModuleOptions | SanctumModuleOptions;

export interface AuthInstance {
  $headers: Headers; // HTTP headers used for authentication
  readonly _prefix: string; // Default prefix for authentication cookies/tokens
  readonly options: ModuleOptions; // Authentication module configuration options
  readonly state: AuthState; // Current authentication state

  // Gets the authenticated user's data (or null if not authenticated)
  get user(): any | null;

  // Gets the name of the active authentication strategy (or null if none is active)
  get strategy(): string | null;

  // Checks if the user is authenticated
  get loggedIn(): boolean;

  // Gets the HTTP headers used for authentication
  get headers(): Headers;

  // Gets the authentication prefix (or null if none)
  get prefix(): string | null;

  // Sets new HTTP headers for authentication
  set headers(headers: Headers);

  // Gets the redirection URLs for a given authentication strategy
  getRedirect(strategyName: string): Record<string, string> | null;

  // Retrieves the CSRF token if required
  csrfToken(event?: any): Promise<boolean>;

  // Initializes the authentication instance (typically called on app load)
  initialize(): Promise<void>;

  // Logs in using a specific authentication strategy
  loginWith(strategyName: string, value: any): Promise<any>;

  // Logs out from the specified authentication strategy
  logout(strategyName: string): Promise<void>;

  // Sends the two-factor authentication (2FA) code for validation
  twoFactor(strategyName: string, code: string): Promise<{ success: boolean }>;
}

export * from './shared';
export * from './providers/passport';
export * from './providers/sanctum';
export * from './core/state';
