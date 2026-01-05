import {
  useLogger,
  createResolver,
  defineNuxtModule,
  addServerHandler,
  addPluginTemplate,
  addRouteMiddleware,
  addTypeTemplate,
  addImportsDir,
} from '@nuxt/kit';
import { defu } from 'defu';
import kebabCase from 'lodash/kebabCase';
import fs from 'fs';

import type {
  ModuleOptions,
  AuthSecretConfig,
  PassportStrategiesOptions,
  PassportFetchOption,
} from './runtime/types';

interface RuntimeConfig {
  secret: {
    [key: string]: AuthSecretConfig;
  };
}

const PACKAGE_NAME: string = 'nuxt-umbu';
export default defineNuxtModule<ModuleOptions & { twoFactorAuth: boolean }>({
  meta: {
    name: PACKAGE_NAME,
    configKey: 'auth',
  },

  async setup(options, nuxt) {
    const logger = useLogger(PACKAGE_NAME);
    const { resolve } = createResolver(import.meta.url);
    const isDev = nuxt.options.dev;
    const provider = options.provider || 'sanctum';

    options = defu(options, {
      cookie: {
        options: {
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
          priority: 'high',
        },
        prefix: 'auth.',
      },
      twoFactorAuth: false,
    }) as ModuleOptions & { twoFactorAuth: boolean };

    options.cookie = options.cookie ?? { prefix: 'auth.', options: {} };
    options.cookie.options = options.cookie.options ?? {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      priority: 'high',
    };

    if (isDev) {
      options.cookie.prefix = 'auth.';
      options.cookie.options.secure = false;
    }

    addImportsDir(resolve('./runtime/composables'));

    // Add middleware template
    addRouteMiddleware({
      name: 'auth',
      path: resolve('./runtime/' + provider + '/middleware/auth'),
    });

    if (provider === 'passport') {
      const runtimeConfig = nuxt.options.runtimeConfig as unknown as RuntimeConfig;

      if (
        !runtimeConfig.secret ||
        typeof runtimeConfig.secret !== 'object' ||
        Object.keys(runtimeConfig.secret).length === 0
      ) {
        logger.error(`Missing "runtimeConfig.secret" in nuxt.config.ts`);
        return;
      }

      Object.entries(runtimeConfig.secret).forEach(([key, config]) => {
        if (!options.strategies[key]) {
          logger.error(
            `[${PACKAGE_NAME}] Strategy "${key}" found in "runtimeConfig.secret" but not in "options.strategies". Skipping validation.`
          );
          return;
        }
        if (!config.client_id || !config.client_secret || !config.grant_type) {
          logger.error(
            `[${PACKAGE_NAME}] Invalid "secret.${key}" configuration. Required keys: client_id, client_secret, grant_type.`
          );
          return;
        }
      });

      Object.entries(options.strategies).forEach(
        ([strategyName, strategy]: [
          string,
          PassportStrategiesOptions & {
            handler?: Record<string, string>[];
          },
        ]) => {
          strategy.handler = strategy.handler ?? [];
          strategy.endpoints = strategy.endpoints || {};
          strategy.endpoints = defu(strategy.endpoints, {
            logout: { alias: 'logout' },
          });
          Object.entries(strategy.endpoints)
            .filter(
              ([key, endpoint]) =>
                key !== 'user' &&
                (key === 'logout' ||
                  ((endpoint as PassportFetchOption).url &&
                    (endpoint as PassportFetchOption).method))
            )
            .forEach(([key, endpoint]) => {
              const typedEndpoint = endpoint as PassportFetchOption;
              const route = `/api/${kebabCase(typedEndpoint.alias) || typedEndpoint.url.replace(/^\/(api|oauth)\//, '')}`;
              const handlerFile = resolve(`./runtime/passport/server/api/${key}`);

              strategy.handler!.push({ [key]: route });

              addServerHandler({
                route,
                handler: handlerFile,
              });
            });
        }
      );
    }

    const has2FA = Object.values(options.strategies).some(
      (strategy) => strategy.endpoints?.['2fa']?.url && strategy.endpoints?.['2fa']?.method
    );

    if (has2FA) {
      options.twoFactorAuth = true;

      addRouteMiddleware({
        name: '_2fa',
        path: resolve('./runtime/' + provider + '/middleware/2fa'),
      });
      logger.success('Middleware `_2fa` enabled');
    }

    nuxt.options.runtimeConfig.public[PACKAGE_NAME] = options;

    const hasTsPlugin = fs.existsSync(resolve(`./runtime/${provider}/plugin.ts`));

    // Add plugin template
    addPluginTemplate({
      src: resolve(`./runtime/${provider}/plugin.${hasTsPlugin ? 'ts' : 'js'}`),
      filename: `plugin.${hasTsPlugin ? 'ts' : 'js'}`,
      mode: 'all',
    });

    nuxt.options.alias['#auth-utils'] = resolve('./runtime/' + provider + '/utils');

    logger.success('`nuxt-umbu` setup done');
  },
});

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    secret?: Record<string, AuthSecretConfig>;
  }

  interface PublicRuntimeConfig {
    baseURL: string;
  }
}
