import { createError } from 'h3';

import type { TwoFactorFetchOption } from '#auth-types';

export interface TokenResponse {
  token: string;
  refresh_token: string;
  expires: string;
}

/**
 * Validates token response structure.
 * @param response The response object to validate.
 * @param isRefresh Whether this is a refresh token flow (refresh_token is optional).
 * @throws An error if the response is invalid.
 */
export function validateTokenResponse(response: any, isRefresh: boolean = false): void {
  const expiresIn = Number(response?.expires_in);
  if (typeof response?.access_token !== 'string' || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw createError({ statusCode: 502, statusMessage: 'Invalid token response' });
  }
  
  // refresh_token is optional for refresh flows (many OAuth providers don't return it)
  if (!isRefresh && !response?.refresh_token) {
    throw createError({ statusCode: 502, statusMessage: 'Invalid token response: missing refresh_token' });
  }
}

/**
 * Validates 2FA response structure.
 * @param response The response object to validate.
 * @param configT2fa The passport strategies configuration containing twoFactor endpoint settings.
 * @throws An error if the response is invalid.
 */
export function validateTwoFactorResponse(response: any, configT2fa: TwoFactorFetchOption): void {
  const property = configT2fa?.property || 'access_token';
  const expires = configT2fa?.expires || 'expires_in';
  
  const expiresIn = Number(response?.[expires]);
  if (!response?.[property] || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid 2FA response structure',
    });
  }
}

/**
 * Validates request body for authentication endpoints.
 * @param body The request body to validate.
 * @param requiredFields Array of required field names.
 * @throws An error if validation fails.
 */
export function validateRequestBody(body: any, requiredFields: string[]): void {
  if (body == null || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
  }

  for (const field of requiredFields) {
    if (
      !(field in body) ||
      body[field] == null ||
      (typeof body[field] === 'string' && body[field].trim() === '')
    ) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Missing required parameter: ${field}` 
      });
    }
  }
}

/**
 * Formats token response for client.
 * @param response The raw token response from API.
 * @returns Formatted token response.
 */
export function formatTokenResponse(response: any): TokenResponse {
  const token = 'Bearer ' + response.access_token;
  const expiresIn = Number(response.expires_in);
  const expires = String(Date.now() + expiresIn * 1000);

  return { 
    token, 
    refresh_token: response.refresh_token || '', // optional for refresh flows
    expires 
  };
}

/**
 * Formats 2FA response for client.
 * @param response The raw 2FA response from API.
 * @param configT2fa The passport strategies configuration containing twoFactor endpoint settings.
 * @returns Formatted 2FA response.
 */
export function formatTwoFactorResponse(response: any, configT2fa: TwoFactorFetchOption): { token: string; expires: string } {
  const property = configT2fa?.property || 'access_token';
  const expires = configT2fa?.expires || 'expires_in';

  const expiresIn = Number(response[expires]);
  const expiresTime = String(Date.now() + expiresIn * 1000);
  return { token: response[property], expires: expiresTime };
}
