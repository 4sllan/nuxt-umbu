import { getCookie, H3Event } from 'h3';
import { getAuthConfig } from './config';

// Re-export all functions from specialized modules
export * from './config';
export * from './cookies';
export * from './requests';
export * from './validation';
export * from './errors';

interface AuthSession {
  token?: string;
  expires?: string;
  strategyName?: string;
}

/**
 * Retrieves the authentication session from HTTP-only cookies.
 * @param event The H3 event from the request.
 * @returns An object containing token, expires, and strategyName.
 * @throws An error if the authentication configuration is missing.
 */
export function getAuthSession(event: H3Event): AuthSession {
  const config = getAuthConfig();
  const strategyName: string | undefined = getCookie(event, config.prefix + 'strategy') || undefined;
  const token: string | undefined = strategyName
    ? getCookie(event, config.prefix + '_token.' + strategyName) || undefined
    : undefined;
  const expires: string | undefined = strategyName
    ? getCookie(event, config.prefix + '_token_expiration.' + strategyName) || undefined
    : undefined;

  return { token, expires, strategyName };
}
