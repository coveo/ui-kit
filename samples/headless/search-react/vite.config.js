import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(({ssrBuild}) => {
  const config = {
    plugins: [react()],
    server: {
      open: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };

  // SSR build configuration
  if (ssrBuild) {
    config.build = {
      rollupOptions: {
        output: {
          entryFileNames: 'index.js',
        },
      },
    };
  }

  return config;
});
