/**
 * This is the Vite configuration for an Atomic application that may use the CDN and NPM depending on the environment.
 * This adds up a decent amount of flexibility but come with some complexity.
 * This can be streamline as such for NPM usage:
 * ```typescript
 * import { defineConfig } from 'vite';
 * import { linkAtomicStaticAssetsToPublicDir } from './scripts/linkAtomicAssetsToPublic
 * linkAtomicStaticAssetsToPublicDir();
 * export default defineConfig({
 *   build: {
 *     target: 'es2024',
 *   },
 * });
 * ```
 * Or for CDN usage:
 * ```typescript
 * import { defineConfig, loadEnv } from 'vite';
 * export default defineConfig(({ mode }) => {
 *   const env = loadEnv(mode, process.cwd(), '');
 *   process.env.VITE_ATOMIC_CDN_THEME_URL = 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css';
 *   return {
 *     build: {
 *       target: 'es2024',
 *     },
 *     resolve: {
 *       alias: {
 *         '@coveo/atomic/loader': 'https://static.cloud.coveo.com/atomic/v3/index.js',
 *         '@coveo/headless': 'https://static.cloud.coveo.com/headless/v3/headless.esm.js',
 *       },
 *     }
 *   };
 *
 */
import {defineConfig, loadEnv} from 'vite';
import {linkAtomicStaticAssetsToPublicDir} from './scripts/linkAtomicAssetsToPublicDir.js';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // When using the Atomic CDN, the assets are resolved & served directly from the CDN.
  if (!env.VITE_ATOMIC_USE_CDN) {
    linkAtomicStaticAssetsToPublicDir();
  }

  // When using the Atomic CDN, we should use the CDN URL for the Atomic CSS theme.
  process.env.VITE_ATOMIC_CDN_THEME_URL = env.VITE_ATOMIC_USE_CDN
    ? 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css'
    : '';

  return {
    build: {
      target: 'es2024',
    },
    // When using the Atomic CDN, we should resolves our imports from Atomic to the CDN URLs.
    ...(env.VITE_ATOMIC_USE_CDN && {
      resolve: {
        alias: {
          '@coveo/atomic/loader':
            'https://static.cloud.coveo.com/atomic/v3/index.js',
          '@coveo/headless':
            'https://static.cloud.coveo.com/headless/v3/headless.esm.js',
        },
      },
    }),
  };
});
