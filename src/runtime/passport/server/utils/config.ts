import { useRuntimeConfig } from '#imports';
import { createError } from 'h3';
import type { PassportModuleOptions, AuthSecretConfig } from '#auth-types';

export type SecretConfigMap = {
  [key: string]: AuthSecretConfig;
};

export interface AuthConfig {
  baseURL: string;
  config: PassportModuleOptions;
  secret?: SecretConfigMap;
  prefix: string;
  cookieOptions: any;
}

/**
 * Retrieves and validates authentication configuration.
 * @returns Authentication configuration object.
 * @throws An error if the authentication configuration is missing.
 */
export function getAuthConfig(): AuthConfig {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.baseURL;
  const config = runtimeConfig.public['nuxt-umbu'] as PassportModuleOptions;
  const secret = runtimeConfig.secret as SecretConfigMap;

  if (!config) {
    throw createError({ statusCode: 500, statusMessage: 'Authentication module not configured' });
  }
  if (!baseURL || typeof baseURL !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'Authentication baseURL not configured' });
  }

  const { cookie } = config;
  const prefix = cookie?.prefix || 'auth.';
  const cookieOptions = cookie?.options || {};

  return { baseURL, config, secret, prefix, cookieOptions };
}

/**
 * Validates and retrieves strategy configuration.
 * @param strategyName The name of the strategy to validate.
 * @param config The authentication configuration.
 * @returns The strategy configuration.
 * @throws An error if the strategy is invalid or not configured.
 */
export function validateStrategy(strategyName: string, config: PassportModuleOptions) {
  if (!strategyName) {
    throw createError({ statusCode: 400, statusMessage: 'Strategy name is required' });
  }

  const strategy = config.strategies?.[strategyName];
  if (!strategy) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid authentication strategy' });
  }

  return strategy;
}
