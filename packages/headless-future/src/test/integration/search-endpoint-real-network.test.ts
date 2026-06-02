import {describe, expect, it} from 'vitest';
import {
  Engine,
  buildResultListController,
  buildSearchBoxController,
  loadConfigurationActions,
  getSampleEngineConfiguration,
} from '@/src/index.js';
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

describe('search endpoint real-network sanity check', () => {
  it('runs query end-to-end and updates state from real response', async () => {
    const engine = new Engine();
    const fullEngine = getFullEngine(engine);

    loadConfigurationActions(engine).setConfiguration(sampleConfiguration);

    const searchBox = buildSearchBoxController({engine});
    const resultList = buildResultListController({engine});
    SearchEndpointFacade.getInstance(fullEngine);

    searchBox.setQuery({query});
    searchBox.submit();

    await waitFor(() => {
      return fullEngine.read(searchEndpointSelectors.status) === 'idle';
    });

    const error = fullEngine.read(searchEndpointSelectors.error);
    if (error !== null) {
      throw new Error(`Search API returned an error: ${error}`);
    }

    const stateResults = resultList.state.results;
    expect(stateResults.length).toBeGreaterThan(0);

    const firstStateResult = stateResults[0];
    expect(firstStateResult).toHaveProperty('uniqueId');
    expect(firstStateResult).toHaveProperty('title');
    expect(firstStateResult).toHaveProperty('uri');
  }, 40000);
});
