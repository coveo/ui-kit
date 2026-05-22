import {describe, expect, it} from 'vitest';
import {
  Engine,
  buildResultListController,
  buildSearchBoxController,
  loadConfigurationActions,
  getSampleEngineConfiguration,
} from '@/src/index.js';
import type {CoveoSearchEndpointResponse} from '@/src/api/index.js';
import {
  SearchEndpointFacade,
  getFullEngine,
  searchEndpointSelectors,
} from '@/src/core/index.js';

const sampleConfiguration = getSampleEngineConfiguration();
const query = 'test';

const waitFor = async (
  predicate: () => boolean,
  timeoutMs = 30000,
  intervalMs = 200
) => {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out after ${timeoutMs}ms waiting for condition.`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};

function getResponseOrThrow(
  response: Readonly<CoveoSearchEndpointResponse> | null
): Readonly<CoveoSearchEndpointResponse> {
  if (!response) {
    throw new Error('Expected a response payload but received null.');
  }

  return response;
}

describe('search endpoint real-network sanity check', () => {
  // Temporary e2e sanity check while headless-future is in development; when production-ready, prefer MSW-mocked network requests.
  it('runs query end-to-end and updates state from real response', async () => {
    const engine = new Engine();
    const fullEngine = getFullEngine(engine);
    const config = loadConfigurationActions(engine);

    config.setConfiguration(sampleConfiguration);

    const searchBox = buildSearchBoxController({engine});
    const resultList = buildResultListController({engine});
    const facade = SearchEndpointFacade.getInstance(fullEngine);

    let lastResponse: Readonly<CoveoSearchEndpointResponse> | null = null;
    const unsubscribe = facade.onResponse((response) => {
      lastResponse = response;
    });

    try {
      searchBox.setQuery({query});
      searchBox.submit();

      await waitFor(() => {
        return fullEngine.read(searchEndpointSelectors.status) === 'idle';
      });

      const error = fullEngine.read(searchEndpointSelectors.error);
      if (error !== null) {
        throw new Error(`Search API returned an error: ${error}`);
      }

      expect(lastResponse).not.toBeNull();
      const response = getResponseOrThrow(lastResponse);

      const responseResults = response.results;
      const stateResults = resultList.state.results;

      expect(stateResults).toHaveLength(responseResults.length);

      if (responseResults.length === 0) {
        expect(stateResults).toEqual([]);
        return;
      }

      const firstResponseResult = responseResults[0];
      const firstStateResult = stateResults[0];

      expect(firstStateResult).toMatchObject({
        id: firstResponseResult.uri,
        title: firstResponseResult.title,
        uri: firstResponseResult.uri,
        excerpt: firstResponseResult.excerpt,
      });
    } finally {
      unsubscribe();
    }
  }, 40000);
});
