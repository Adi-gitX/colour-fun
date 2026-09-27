import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

/**
 * Serves the Vercel functions in api/ from the dev server, so `npm run dev` runs the whole app.
 * Handlers are Web-standard (Request → Response) and are loaded through Vite on every call, so
 * edits to api/ and server/ apply without a restart.
 */
function apiInDev(): Plugin {
  return {
    name: 'garden-api-dev',
    apply: 'serve',
    configureServer(server) {
      // Server-side secrets (GEMINI_API_KEY, GITHUB_TOKEN) come from .env like on Vercel.
      for (const [k, v] of Object.entries(loadEnv(server.config.mode, process.cwd(), ''))) process.env[k] ??= v;
      server.middlewares.use(async (req, res, next) => {
        const name = req.url?.match(/^\/api\/([a-z-]+)(?:[?#]|$)/)?.[1];
        if (!name) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod[req.method ?? 'GET'] as ((r: Request) => Promise<Response>) | undefined;
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const response = await handler(
            new Request(`http://localhost${req.url}`, {
              method: req.method,
              headers,
              body: chunks.length ? Buffer.concat(chunks) : undefined,
            })
          );
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (response.body) for await (const chunk of response.body) res.write(chunk);
          res.end();
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    apiInDev(),
    react(),
    tailwindcss(),
    VitePWA({
      // Garden answers live from the web, so there is no offline mode. Earlier builds installed an
      // offline service worker; this one replaces it, unregisters itself and clears its caches,
      // so nobody is left on a stale copy. The web app manifest (name, icons) stays.
      selfDestroying: true,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Garden: stunning, not slop',
        short_name: 'Garden',
        description: 'Find the design worth using, judged from live web search and real reviews. No AI slop.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
