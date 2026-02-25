import myModule from '../src/module'
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
    devtools: {
      enabled: true,

      timeline: {
        enabled: true,
      },
    },

    ssr: false,

    app: {
        head: {
            title: 'Secure Login - 2FA Authentication',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Secure authentication with two-factor verification' }
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
        csrf: '/sanctum/csrf-cookie',
        provider: 'sanctum',
        strategies: {
            client:{
                redirect: {
                    logout: "/auth",
                    login: "/auth"
                },
                user: {
                    property: "profile",
                },
                endpoints: {
                    login: {url: "/login", method: "post"},
                    user: {url: "/api/profile", method: "get"},
                    "2fa": {url: "/api/token-2fa", method: "post"},
                    logout: {url: "/api/logout", method: "post"}
                },
            }
        }
    },

    runtimeConfig: {
        // Keys within public are also exposed client-side
        public: {
            apiBase: '/api',
            baseURL: process.env.baseURL,
        }
    },

    compatibilityDate: '2025-02-16',
})