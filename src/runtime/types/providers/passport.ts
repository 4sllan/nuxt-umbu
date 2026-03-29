import type {AuthOptionsCookie, RedirectOptions} from '../shared';

// Configuração de credenciais secretas para autenticação (baseada em OAuth)
export interface AuthSecretConfig {
    client_id: string | number; // ID do cliente OAuth
    client_secret: string; // Segredo do cliente OAuth
    grant_type: 'password' | 'authorization_code'; // Tipo de concessão para autenticação
}

// Response format for user profile retrieval
export interface ProfileResponse {
    profile: Record<string, unknown>; // User profile data (structure depends on the authentication strategy)
    strategyName: string; // Name of the authentication strategy used
    token: string; // Authentication token
}

// Response format for authentication actions (e.g., login, token refresh)
export interface AuthResponse {
    token: string; // Access token for authentication
    expires: string; // Token expiration timestamp
    refresh_token: string; // Refresh token for renewing authentication
}

// Type definition for fetch options
export type PassportFetchOption = {
    url: string; // API endpoint URL
    method: string; // HTTP method (e.g., GET, POST, PUT, DELETE)
    alias?: string; // Optional alias for easier reference
};

export type TwoFactorFetchOption = PassportFetchOption & {
    property?: string; // onde vem o token (default: access_token)
    expires?: string; // onde vem o tempo (default: expires_in)
    headerName?: string; // nome do header (default: '2fa')
};

// Type definition for authentication-related API endpoints
type EndpointsOptions = {
    login: PassportFetchOption; // Endpoint for user login
    user: { url: string; method: string, property?: string; }; // Endpoint to fetch user data
    twoFactor?: TwoFactorFetchOption // Optional endpoint for two-factor authentication (2FA)
    refresh?: PassportFetchOption; // Optional endpoint to refresh authentication tokens
    logout?: { alias?: string }; // Optional alias for the logout function
};

// Options for different authentication strategies
export type PassportStrategiesOptions = {
    endpoints: EndpointsOptions; // Endpoints for the authentication strategy
    redirect: RedirectOptions; // Redirection configuration
};

// Type definition for multiple authentication strategies
type AuthOptionsStrategies = {
    [key: string]: PassportStrategiesOptions; // Dynamic key for different authentication strategies
};

// Interface for the authentication instance
// Configurações do módulo de autenticação
export interface PassportModuleOptions {
    csrf?: string; // Token CSRF para proteção de requisições (opcional)
    provider: 'passport';
    cookie?: AuthOptionsCookie; // Configuração de cookies para autenticação (opcional)
    strategies: AuthOptionsStrategies; // Configuração das estratégias de autenticação (obrigatório)
}
