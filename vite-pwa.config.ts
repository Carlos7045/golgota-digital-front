import { VitePWA } from 'vite-plugin-pwa';

export const vitePWAConfig = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            return `${request.url}?v=1`;
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          }
        }
      },
      {
        urlPattern: /\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5 // 5 minutes
          },
          networkTimeoutSeconds: 10
        }
      }
    ]
  },
  includeAssets: ['favicon.ico', 'icons/*.svg', 'icons/*.png'],
  manifest: {
    name: 'Comando Gólgota',
    short_name: 'CmdGólgota',
    description: 'Plataforma comunitária militar cristã para treinamentos, eventos e comunicação',
    theme_color: '#D4AF37',
    background_color: '#0A0A0A',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    start_url: '/',
    categories: ['lifestyle', 'social', 'education'],
    lang: 'pt-BR',
    icons: [
      {
        src: '/icons/icon-72x72.svg',
        sizes: '72x72',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-96x96.svg',
        sizes: '96x96',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-128x128.svg',
        sizes: '128x128',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-144x144.svg',
        sizes: '144x144',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-152x152.svg',
        sizes: '152x152',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-384x384.svg',
        sizes: '384x384',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable any'
      }
    ],
    shortcuts: [
      {
        name: 'Comunidade',
        short_name: 'Chat',
        description: 'Acesso direto ao chat da comunidade',
        url: '/comunidade',
        icons: [{ src: '/icons/icon-96x96.svg', sizes: '96x96' }]
      },
      {
        name: 'Perfil',
        short_name: 'Profile',
        description: 'Visualizar e editar perfil',
        url: '/perfil',
        icons: [{ src: '/icons/icon-96x96.svg', sizes: '96x96' }]
      },
      {
        name: 'Pagamentos',
        short_name: 'Payments',
        description: 'Gerenciar pagamentos e mensalidades',
        url: '/pagamentos',
        icons: [{ src: '/icons/icon-96x96.svg', sizes: '96x96' }]
      }
    ]
  },
  devOptions: {
    enabled: process.env.NODE_ENV === 'development',
    type: 'module'
  }
});

export default vitePWAConfig;