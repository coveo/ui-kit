import {test, searchApi} from '../fixtures.js';

test('IPX modal renders results', async ({renderPage}) => {
  await renderPage({
    page: 'ipx.html',
    handlers: searchApi.handlers,
    interfaceTag: 'atomic-search-interface',
    initializeOptions: {accessToken: 'test-token', organizationId: 'testorg'},
    firstRequest: 'executeFirstSearch',
    itemSelector: 'atomic-result-list atomic-result',
  });
});
