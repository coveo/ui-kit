import {defineCustomElements} from '@coveo/atomic/loader';
import {getSampleSearchEngineConfiguration} from '@coveo/headless';

if (!import.meta.env.VITE_ATOMIC_USE_CDN) {
  import('@coveo/atomic/themes/coveo.css', {assert: {type: 'css'}});
}

defineCustomElements();
await customElements.whenDefined('atomic-search-interface');
const searchInterface =
  document.querySelector<HTMLAtomicSearchInterfaceElement>(
    'atomic-search-interface'
  );
if (!searchInterface) {
  throw new Error('atomic-search-interface element not found in the document.');
}

// When using Atomic from NPM, linked assets from the `public/atomic` directory should be used.
if (!import.meta.env.VITE_ATOMIC_USE_CDN) {
  searchInterface.iconAssetsPath = './atomic/assets';
  searchInterface.languageAssetsPath = './atomic/lang';
}

await searchInterface.initialize(getSampleSearchEngineConfiguration());
searchInterface.executeFirstSearch();
