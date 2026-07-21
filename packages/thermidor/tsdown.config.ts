import {defineConfig} from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'esm',
  unbundle: true,
  dts: true,
  fixedExtension: false,
  treeshake: false,
});
