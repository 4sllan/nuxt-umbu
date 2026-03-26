import myModule from '../src/module'

export default defineNuxtConfig({
    devtools: {
        enabled: true,

        timeline: {
            enabled: true,
        },
    },

    ssr: true,

    app: {
        head: {
            title: 'Secure Login - 2FA Authentication',
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {name: 'description', content: 'Secure authentication with two-factor verification'}
            ]
        }
    },

    css: ['~/assets/css/main.css'],

    // Modules:
    modules: [
        myModule
    ],

    // Nuxt-simple-auth Configuration

    auth: {
        cookie: {
            options: {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                priority: 'high',
            },
            prefix: '__Secure-'
        },
        provider: 'passport',
        strategies: {
            admin: {
                redirect: {
                    logout: "/",
                    login: "/"
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post", alias: "auth token"},
                    user: {
                        url: "/api/admin/profile",
                        method: "get",
                        property: "profile"
                    },
                    twoFactor: {
                        url: '/api/admin/token_2fa',
                        method: 'post',
                        alias: "two factor auth",
                        property: "access_token",
                        expires: "expires_in",
                        headerName: "2fa", // default
                    },
                },
            },
            client: {
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                endpoints: {
                    login: {url: "/oauth/token", method: "post"},
                    user: {
                        url: "/api/profile",
                        method: "get",
                        property: "profile"
                    },
                    twoFactor: {url: "/api/send-token-2fa", method: "post"},
                    logout: {alias: 'logout client'}
                },
            }
        }
    },

    runtimeConfig: {
        // The private keys which are only available server-side
        secret: {
            admin: {
                client_id: process.env.AUTH_CLIENT_ID || '',
                client_secret: process.env.AUTH_CLIENT_SECRET || '',
                grant_type:
                    (process.env.AUTH_GRANT_TYPE as 'password' | 'authorization_code') || 'password',
            },
            client: {
                client_id: process.env.AUTH_CLIENT_ID || '',
                client_secret: process.env.AUTH_CLIENT_SECRET || '',
                grant_type:
                    (process.env.AUTH_GRANT_TYPE as 'password' | 'authorization_code') || 'password',
            },
        },


        // Keys within public are also exposed client-side
        public: {
            apiBase: '/api',
            baseURL: process.env.baseURL,
        }
    },

    compatibilityDate: '2025-02-16',
})