import { createError } from 'h3';

/**
 * Handles authentication errors with consistent logging and formatting.
 * @param error The error to handle.
 * @param context The context where the error occurred.
 * @throws A formatted error.
 */
export function handleAuthError(error: unknown, context: string): never {
  console.error(`[${context} Error]`, {
    statusCode: (error && typeof error === 'object' && 'statusCode' in error) ? Number(error.statusCode) : 500,
    statusMessage: (error && typeof error === 'object' && 'statusMessage' in error) ? String(error.statusMessage) : 'Authentication failed',
  });
  throw createError({
    statusCode: (error && typeof error === 'object' && 'statusCode' in error) ? Number(error.statusCode) : 500,
    statusMessage: 'Authentication failed',
  });
}

/**
 * Handles logout errors with consistent logging.
 * @param error The error to handle.
 * @returns Error response object for logout.
 */
export function handleLogoutError(error: unknown): { success: false; error: string } {
  console.error('Error in logout handler:', {
    statusCode: (error && typeof error === 'object' && 'statusCode' in error) ? Number(error.statusCode) : 500,
    statusMessage: (error && typeof error === 'object' && 'statusMessage' in error) ? String(error.statusMessage) : 'Logout failed',
  });
  return { success: false, error: 'Logout failed' };
}

/**
 * Creates a standard authentication error.
 * @param statusCode The HTTP status code.
 * @param message The error message.
 * @throws A formatted error.
 */
export function createAuthError(statusCode: number, message: string): never {
  throw createError({ statusCode, statusMessage: message });
}

/**
 * Creates a validation error for missing parameters.
 * @param field The missing field name.
 * @throws A formatted error.
 */
export function createValidationError(field: string): never {
  throw createError({ 
    statusCode: 400, 
    statusMessage: `Missing required parameter: ${field}` 
  });
}

/**
 * Creates a configuration error.
 * @param message The error message.
 * @throws A formatted error.
 */
export function createConfigError(message: string): never {
  throw createError({ statusCode: 500, statusMessage: message });
}

/**
 * Creates a strategy error.
 * @param message The error message.
 * @throws A formatted error.
 */
export function createStrategyError(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message });
}
