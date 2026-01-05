import type { AuthOptionsCookie, RedirectOptions } from '../shared';

// Type definition for fetch options
type FetchOption = {
  url: string; // API endpoint URL
  method: string; // HTTP method (e.g., GET, POST, PUT, DELETE)
};

// Type definition for authentication-related API endpoints
type EndpointsOptions = {
  login: FetchOption; // Endpoint for user login
  user: FetchOption; // Endpoint to fetch user data
  '2fa'?: FetchOption; // Optional endpoint for two-factor authentication (2FA)
  refresh?: FetchOption; // Optional endpoint to refresh authentication tokens
  logout?: FetchOption; // Endpoint for user logout
};

// Options for different authentication strategies
export type SanctumStrategiesOptions = {
  user?: { property?: string }; // Name of the object containing user data (optional)
  endpoints: EndpointsOptions; // Endpoints for the authentication strategy
  redirect: RedirectOptions; // Redirection configuration
};

// Type definition for multiple authentication strategies
type AuthOptionsStrategies = {
  [key: string]: SanctumStrategiesOptions; // Dynamic key for different authentication strategies
};

// Configurações do módulo de autenticação
export interface SanctumModuleOptions {
  csrf: string; // Token CSRF laravel sanctum
  provider: 'sanctum';
  cookie?: AuthOptionsCookie; // Configuração de cookies para autenticação (opcional)
  strategies: AuthOptionsStrategies; // Configuração das estratégias de autenticação (obrigatório)
}
