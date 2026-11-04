import {test, insightApi} from '../fixtures.js';

test('Insight page renders results', async ({renderPage}) => {
  await renderPage({
    page: 'insight.html',
    handlers: insightApi.handlers,
    interfaceTag: 'atomic-insight-interface',
    initializeOptions: {
      accessToken: 'test-token',
      organizationId: 'testorg',
      insightId: 'test-insight-id',
    },
    firstRequest: 'executeFirstSearch',
    itemSelector: 'atomic-insight-result-list atomic-insight-result',
  });
});
