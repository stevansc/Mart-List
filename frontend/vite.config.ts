import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        manifest: {
          name: 'Toko Lintang Baru',
          short_name: 'Mart List',
          description: 'Sistem inventaris minimarket Toko Lintang Baru dengan tampilan bersih, kontras tinggi yang ramah untuk orang tua.',
          theme_color: '#2563eb',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=192&h=192&fit=crop&q=80',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=512&h=512&fit=crop&q=80',
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => {
                // Cache GET requests to the backend /items/ endpoint
                return url.pathname.includes('/items/') || url.href.includes('/items/');
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-items-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 24 * 60 * 60 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: ({ url }) => {
                // Also cache Unsplash/external images for offline display!
                return (
                  url.origin === 'https://images.unsplash.com' ||
                  url.pathname.endsWith('.png') ||
                  url.pathname.endsWith('.jpg') ||
                  url.pathname.endsWith('.jpeg') ||
                  url.pathname.endsWith('.webp')
                );
              },
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'external-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 24 * 60 * 60 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
