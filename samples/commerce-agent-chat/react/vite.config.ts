import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const envDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, envDir, '');

  return {
    envDir,
    plugins: [
      react(),
      {
        name: 'heuristic-classify',
        configureServer(server) {
          server.middlewares.use(
            '/api/heuristics/classify',
            (req, res, next) => {
              import('./server/classifyMiddleware.js').then(
                ({classifyQueryMiddleware}) =>
                  classifyQueryMiddleware(req, res),
                () => next()
              );
            }
          );
        },
      },
    ],
    resolve: {
      alias: {
        '@core': path.resolve(__dirname, '../core/src'),
      },
    },
    server: {
      port: 3001,
      strictPort: false,
      proxy: {
        '/api/coveo-dev': {
          target: env.VITE_PLATFORM_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/coveo-dev/, ''),
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
