import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // With VITE_GATEWAY_PROXY_TARGET (e.g. http://127.0.0.1:8990), `/api` is proxied to a local Agent
  // Gateway, so VITE_COVEO_ENDPOINT can be a same-origin path and the browser needs no CORS.
  const gateway = env['VITE_GATEWAY_PROXY_TARGET'];
  return {
    plugins: [react()],
    server: {
      port: 5174,
      open: true,
      ...(gateway ? {proxy: {'/api': {target: gateway, changeOrigin: true}}} : {}),
    },
  };
});
