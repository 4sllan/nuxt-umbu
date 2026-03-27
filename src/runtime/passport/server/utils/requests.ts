import { $fetch } from 'ofetch';
import { createError } from 'h3';

/**
 * Makes an authenticated API request with error handling.
 * @param url The API endpoint URL.
 * @param baseURL The base URL for the API.
 * @param options The request options.
 * @returns The response data.
 * @throws An error if the request fails.
 */
export async function makeAuthRequest<T = any>(
  url: string,
  baseURL: string,
  options: any = {}
): Promise<T> {
  const defaultOptions = {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  };

  return await $fetch<T>(url, {
    baseURL,
    ...defaultOptions,
  }).catch((error) => {
    console.error('[API Error]', error);
    throw createError({ 
      statusCode: 502, 
      statusMessage: 'Authentication service error' 
    });
  });
}

/**
 * Makes an authenticated request with Authorization header.
 * @param url The API endpoint URL.
 * @param baseURL The base URL for the API.
 * @param token The authorization token.
 * @param options The request options.
 * @returns The response data.
 * @throws An error if the request fails.
 */
export async function makeAuthenticatedRequest<T = any>(
  url: string,
  baseURL: string,
  token: string,
  options: any = {}
): Promise<T> {
  const authOptions = {
    headers: {
      Authorization: token,
      ...options.headers,
    },
    ...options,
  };

  return makeAuthRequest<T>(url, baseURL, authOptions);
}
