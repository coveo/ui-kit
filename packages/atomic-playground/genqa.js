import './load-atomic.js';
import './nav.js';
import {searchCredentials} from './sample-credentials.js';

await customElements.whenDefined('atomic-search-interface');

const searchInterface = document.querySelector('atomic-search-interface');
await searchInterface.initialize({
  ...searchCredentials,
  search: {
    pipeline: 'genqatest',
  },
});
searchInterface.executeFirstSearch();
