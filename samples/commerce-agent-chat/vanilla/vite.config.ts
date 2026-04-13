import * as path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {defineConfig, loadEnv} = require('vite') as {
  defineConfig: <T>(config: T) => T;
  loadEnv: (
    mode: string,
    envDir: string,
    prefixes?: string
  ) => Record<string, string>;
};

export default defineConfig(({mode}) => {
  const envDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, envDir, '');

  return {
    envDir,
    resolve: {
      alias: {
        '@core': path.resolve(__dirname, '../core/src'),
      },
    },
    server: {
      port: 3004,
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
