import {reactRouter} from '@react-router/dev/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths({
      root: './',
      projects: ['./tsconfig.json'],
    }),
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  resolve: {
    alias: {
      // Force this sample to use the correct react-router version
      'react-router-dom': 'react-router/dom',
    },
  },
});
