/**
 * The CDN's `index.js`, the deprecated name of its `loader.js`. v4 removes it.
 *
 * The warning is a plain `console.warn` on purpose. The shared deprecation helpers live in the chunk
 * that most components share, so importing one would make this file load that chunk first.
 */
console.warn(
  '[Deprecated] The `index.js` file of the Atomic CDN is deprecated and will be removed in Atomic v4. Use `loader.js` instead, which has the same exports.'
);

export * from './loader.js';
