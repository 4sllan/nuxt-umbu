const siteName = 'Nuxt - Umbuzeiro'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'lime',
      neutral: 'zinc'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: siteName
  },
  header: {
    title: siteName,
    to: '/',
    logo: {
      alt: 'Laravel Sanctum & Laravel Passport',
      light: 'logo.svg',
      dark: 'logo.svg'
    },
    search: true,
    colorMode: true,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/4sllan/nuxt-umbu',
        'target': '_blank',
        'aria-label': 'GitHub'
      }
    ]
  },
  footer: {
    credits: `Aslan Gama © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/4sllan',
        'target': '_blank',
        'aria-label': '4slan on GitHub'
      },
    ]
  }
})
