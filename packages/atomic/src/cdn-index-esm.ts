// The CDN's `index.esm.js`: the helpers of the npm main entry, plus the loader, which the npm main entry only gets in
// v4. Why it is built this way: docs/adr/0004-export-the-cdn-loader-from-index-esm-js.md
export * from './index.js';
// On the CDN this helper loads Headless when it is called, so that this file doesn't wait for Headless before it runs.
// An explicit export takes precedence over the one that `export *` brings in.
export {bindLogDocumentOpenOnResult} from './cdn-bind-log-document-open-on-result.js';
// The build leaves this import to the browser and points it at the CDN's `index.js`, the loader bundle next to this
// file, so that a page gets one loader whichever of the two files it uses.
export {
  applyPolyfills,
  atomicVersion,
  defineCustomElements,
  headlessVersion,
  setNonce,
} from './loader.js';
