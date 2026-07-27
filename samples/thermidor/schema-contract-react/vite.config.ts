import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const endpoint = loadEnv(mode, process.cwd(), '').VITE_COVEO_ENDPOINT?.trim();

  return {
    plugins: [react()],
    server: {
      ...(endpoint
        ? {
            proxy: {
              '/rest': {
                target: endpoint,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
  };
});
