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
export async function makeAuthRequest<T = unknown>(
  url: string,
  baseURL: string,
  options: Record<string, unknown> = {}
): Promise<T> {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(typeof options.headers === 'object' && options.headers !== null ? options.headers : {}),
  };

  return await $fetch<T>(url, {
    baseURL,
    timeout: (typeof options.timeout === 'number') ? options.timeout : 10000,
    ...options,
    headers: mergedHeaders,
  }).catch((error: unknown) => {
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
export async function makeAuthenticatedRequest<T = unknown>(
  url: string,
  baseURL: string,
  token: string,
  options: Record<string, unknown> = {}
): Promise<T> {
  const authOptions = {
    headers: {
      Authorization: token,
      ...(typeof options.headers === 'object' && options.headers !== null ? options.headers : {}),
    },
    ...options,
  };

  return makeAuthRequest<T>(url, baseURL, authOptions);
}
