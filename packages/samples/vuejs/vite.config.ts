/* eslint-disable node/no-unpublished-import */
import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.html'],
});
