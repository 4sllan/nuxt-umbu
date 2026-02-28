export default defineNuxtConfig({
    app: {
        head: {
            script: [
                {
                    src: 'https://media.bitterbrains.com/main.js?from=ARTEM&type=top',
                    defer: true,
                    async: true
                }
            ]
        }
    },

    devtools: {
        enabled: true
    },

    css: ['~/assets/css/main.css'],

    modules: [
        '@nuxt/image',
        '@nuxt/ui',
        '@nuxt/content',
        'nuxt-og-image',
        'nuxt-llms'
    ],

    content: {
        build: {
            markdown: {
                toc: {
                    searchDepth: 1
                }
            }
        }
    },

    compatibilityDate: '2024-07-11',

    nitro: {
        prerender: {
            routes: [
                '/'
            ],
            crawlLinks: true,
            autoSubfolderIndex: false
        }
    },

    icon: {
        provider: 'iconify'
    },

    llms: {
        domain: 'https://nuxt-umbu.dev',
        title: 'Nuxt Umbu',
        description: 'Authentication module for Nuxt 4 with first-class Laravel Sanctum support and optional Passport driver.',
        full: {
            title: 'Nuxt Umbu – Authentication for Nuxt 4',
            description: 'Complete documentation for Nuxt Umbu authentication module for Nuxt 4, featuring Laravel Sanctum integration, optional Passport strategies, CSRF protection, httpOnly cookies, route middleware, composables and two-factor authentication.'
        },

        sections: [
            {
                title: 'Introduction',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/introduction%'}
                ]
            },
            {
                title: 'Getting Started',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/getting-started%'}
                ]
            },
            {
                title: 'Sanctum Integration',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/sanctum%'}
                ]
            },
            {
                title: 'Passport Strategies (Optional)',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/passport%'}
                ]
            },
            {
                title: 'Composables',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/composables%'}
                ]
            },
            {
                title: 'Route Middleware',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/middleware%'}
                ]
            },
            {
                title: 'Two-Factor Authentication (2FA)',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/2fa%'}
                ]
            },
            {
                title: 'Security',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/security%'}
                ]
            },
            {
                title: 'Advanced Usage',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/advanced%'}
                ]
            },
            {
                title: 'Troubleshooting',
                contentCollection: 'docs',
                contentFilters: [
                    {field: 'path', operator: 'LIKE', value: '/troubleshooting%'}
                ]
            }
        ]
    },

    content: {
        experimental: { nativeSqlite: true },
    },
})
