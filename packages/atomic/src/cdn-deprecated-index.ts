// The CDN's `index.js`, deprecated in favor of `index.esm.js`, which exports the same loader. v4 removes it. The
// warning is a plain `console.warn`: the shared deprecation helper would make this file load the shared chunk.
console.warn(
  '[Deprecated] The `index.js` file of the Atomic CDN is deprecated and will be removed in Atomic v4. Import from `index.esm.js` instead, which exports everything this file exports.'
);

export * from './loader.js';
