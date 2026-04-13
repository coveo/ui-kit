import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const envDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, envDir, '');

  return {
    envDir,
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('cac-'),
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@core': path.resolve(__dirname, '../core/src'),
      },
    },
    server: {
      port: 3002,
      strictPort: false,
      proxy: {
        '/api/coveo-dev': {
          target: env.VITE_PLATFORM_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (requestPath) =>
            requestPath.replace(/^\/api\/coveo-dev/, ''),
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
