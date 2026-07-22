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
import {defu} from 'defu';

import * as templates from './templates' // Importa tudo da pasta de templates

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
        const {resolve} = createResolver(import.meta.url);
        const isDev = nuxt.options.dev;
        const provider = options.provider || 'sanctum';

        const kebabCase = (str: string) => str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();

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

        options.cookie = options.cookie ?? {prefix: 'auth.', options: {}};
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
        addImportsDir(resolve('./runtime/utils'))

        // Add middleware template
        addRouteMiddleware({
            name: 'umbu:auth',
            path: resolve('./runtime/' + provider + '/middleware/auth'),
        });

        if (provider === 'passport') {
            const runtimeConfig = nuxt.options.runtimeConfig;
            
            if (
                !runtimeConfig.secret ||
                typeof runtimeConfig.secret !== 'object' ||
                Object.keys(runtimeConfig.secret).length === 0
            ) {
                logger.error(`Missing "runtimeConfig.secret" in nuxt.config.ts`);
                return;
            }

            // Type guard to ensure secret has correct structure
            function isValidSecretConfig(secret: unknown): secret is Record<string, AuthSecretConfig> {
                return typeof secret === 'object' && secret !== null && 
                       Object.values(secret).every(config => 
                           typeof config === 'object' && 
                           config !== null &&
                           'client_id' in config &&
                           'client_secret' in config &&
                           'grant_type' in config
                       );
            }

            if (!isValidSecretConfig(runtimeConfig.secret)) {
                logger.error(`Invalid "runtimeConfig.secret" structure in nuxt.config.ts`);
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
                        logout: {alias: 'logout'},
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

                            strategy.handler!.push({[key]: route});

                            addServerHandler({
                                route,
                                handler: handlerFile,
                            });
                        });
                }
            );
        }

        const has2FA = Object.values(options.strategies).some(
            (strategy) => strategy.endpoints?.['twoFactor']?.url && strategy.endpoints?.['twoFactor']?.method
        );

        if (has2FA) {
            options.twoFactorAuth = true;

            addRouteMiddleware({
                name: 'umbu:two-factor',
                path: resolve('./runtime/' + provider + '/middleware/twoFactor'),
            });
            logger.success('Middleware `two-factor` enabled');
        }

        nuxt.options.runtimeConfig.public[PACKAGE_NAME] = options;

        // Caminhos resolvidos para os arquivos reais no runtime
        const runtimeTypesPath = resolve('./runtime/types/index')
        const runtimeUtilsPath = resolve(`./runtime/${provider}/utils/index`)

        // 1. Criar o arquivo de tipos principal em .nuxt/types/umbu.d.ts
        const umbuTypes = addTypeTemplate({
            filename: 'types/umbu.d.ts',
            getContents: () => templates.authTypesTemplate(runtimeTypesPath, runtimeUtilsPath)
        })


        // 2. Configurar Alias de Execução (Vite/Nitro)
        // Isso faz o import { ... } from '#auth-utils' funcionar no código JS
        nuxt.options.alias['#auth-utils'] = runtimeUtilsPath
        nuxt.options.alias['#auth-types'] = runtimeTypesPath


        // 3. Plugins Dinâmicos (Sem depender de arquivos físicos no dist)
        addPluginTemplate({
            filename: 'umbu-plugin.ts',
            getContents: () => {
                return provider === 'passport'
                    ? templates.passportTemplate()
                    : templates.sanctumTemplate()
            },
            mode: 'all'
        })

        // 4. Hook para o TypeScript (VS Code)
        nuxt.hook('prepare:types', ({ references, tsConfig }) => {
            // Faz o TS ler o arquivo umbu.d.ts gerado
            references.push({ path: umbuTypes.dst })

            // Mapeia os aliases no tsconfig.json para os tipos corretos
            tsConfig.compilerOptions = tsConfig.compilerOptions || {}
            tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

            tsConfig.compilerOptions.paths['#auth-utils'] = [runtimeUtilsPath]
            tsConfig.compilerOptions.paths['#auth-types'] = [runtimeTypesPath]
        })

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

    interface NuxtConfig {
        auth?: ModuleOptions;
    }
}
