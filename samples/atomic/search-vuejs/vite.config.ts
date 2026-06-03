import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith('atomic-'),
        },
      },
    }),
  ],
  assetsInclude: ['**/*.html'],
});
