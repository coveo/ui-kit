import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {buildSearchEngine, getSampleSearchEngineConfiguration} from '@coveo/headless';

// Register every Atomic custom element (<atomic-search-interface>, etc.).
defineCustomElements();

// Build the engine with the public `searchuisamples` credentials (safe to
// share) pointed at the `BarcaKnowledge` knowledge-base hub — the same
// configuration as the Headless search samples. When you initialize the
// interface with your own engine, the search hub must be set here (not via the
// `search-hub` attribute). To use this sample as an MRE, replace the
// configuration with your own `{organizationId, accessToken}` and hub/pipeline.
const engine = buildSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    search: {
      searchHub: 'BarcaKnowledge',
    },
  },
});

const searchInterface = document.querySelector('atomic-search-interface');
await customElements.whenDefined('atomic-search-interface');

await searchInterface.initializeWithSearchEngine(engine);

searchInterface.executeFirstSearch();
