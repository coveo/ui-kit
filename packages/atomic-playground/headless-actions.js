import {loadAdvancedSearchQueryActions, loadContextActions} from '@coveo/headless';
import './load-atomic.js';
import './nav.js';
import {searchCredentials} from './sample-credentials.js';

await customElements.whenDefined('atomic-search-interface');

const searchInterface = document.querySelector('atomic-search-interface');
await searchInterface.initialize(searchCredentials);

const {engine} = searchInterface;

engine.dispatch(
  loadAdvancedSearchQueryActions(engine).updateAdvancedSearchQueries({
    aq: '@author="BBC News"',
  })
);

engine.dispatch(
  loadContextActions(engine).addContext({
    contextKey: 'userGroup',
    contextValue: 'sales',
  })
);

searchInterface.executeFirstSearch();
