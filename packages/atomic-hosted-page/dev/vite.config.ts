import {defineConfig} from 'vite';

export default defineConfig({
  define: {
    'process.env.DEPLOYMENT_ENVIRONMENT': JSON.stringify(
      process.env.DEPLOYMENT_ENVIRONMENT || 'LOCAL'
    ),
  },
});
