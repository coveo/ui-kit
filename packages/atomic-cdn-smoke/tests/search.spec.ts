import {test, searchApi} from '../fixtures.js';

test('Search page renders results', async ({renderPage}) => {
  await renderPage({
    page: 'search.html',
    handlers: searchApi.handlers,
    interfaceTag: 'atomic-search-interface',
    initializeOptions: {accessToken: 'test-token', organizationId: 'testorg'},
    firstRequest: 'executeFirstSearch',
    itemSelector: 'atomic-result-list atomic-result',
  });
});
