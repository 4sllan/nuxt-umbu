import { setCookie, deleteCookie, H3Event } from 'h3';
import type { AuthConfig } from './config';

/**
 * Sets authentication cookies for a given strategy.
 * @param event The H3 event from the request.
 * @param strategyName The name of the strategy.
 * @param token The authentication token.
 * @param refreshToken The refresh token.
 * @param expires The expiration timestamp.
 * @param config The authentication configuration.
 */
export function setAuthCookies(
  event: H3Event,
  strategyName: string,
  token: string,
  refreshToken: string,
  expires: number,
  config: AuthConfig
): void {
  const { prefix, cookieOptions } = config;

  setCookie(event, prefix + '_token.' + strategyName, token, cookieOptions);
  setCookie(event, prefix + 'strategy', strategyName, cookieOptions);
  setCookie(event, prefix + '_token_expiration.' + strategyName, expires.toString(), cookieOptions);
  
  if (refreshToken) {
    setCookie(event, prefix + '_refresh_token.' + strategyName, refreshToken, cookieOptions);
  }
}

/**
 * Deletes authentication cookies for a given strategy.
 * @param event The H3 event from the request.
 * @param strategyName The name of the strategy.
 * @param config The authentication configuration.
 * @param includeTwoFactor Whether to also delete 2FA cookies.
 */
export function deleteAuthCookies(
  event: H3Event,
  strategyName: string,
  config: AuthConfig,
  includeTwoFactor: boolean = false
): void {
  const { prefix, cookieOptions } = config;

  deleteCookie(event, prefix + '_token.' + strategyName, cookieOptions);
  deleteCookie(event, prefix + 'strategy', cookieOptions);
  deleteCookie(event, prefix + '_token_expiration.' + strategyName, cookieOptions);
  deleteCookie(event, prefix + '_refresh_token.' + strategyName, cookieOptions);

  if (includeTwoFactor) {
    deleteCookie(event, prefix + '_2fa.' + strategyName, cookieOptions);
    deleteCookie(event, prefix + '_2fa_expiration.' + strategyName, cookieOptions);
  }
}

/**
 * Sets 2FA authentication cookies.
 * @param event The H3 event from the request.
 * @param strategyName The name of the strategy.
 * @param token The 2FA token.
 * @param expires The expiration timestamp.
 * @param config The authentication configuration.
 */
export function setTwoFactorCookies(
  event: H3Event,
  strategyName: string,
  token: string,
  expires: number,
  config: AuthConfig
): void {
  const { prefix, cookieOptions } = config;

  setCookie(event, prefix + '_2fa.' + strategyName, token, cookieOptions);
  setCookie(event, prefix + '_2fa_expiration.' + strategyName, expires.toString(), cookieOptions);
}
