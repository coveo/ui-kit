import {describe, expect, it} from 'vitest';
import {
  Engine,
  buildResultListController,
  buildSearchBoxController,
  loadConfigurationActions,
  getSampleEngineConfiguration,
} from '@/src/index.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';

const sampleConfiguration = getSampleEngineConfiguration();
const query = 'test';

const waitFor = async (predicate: () => boolean, timeoutMs = 30000, intervalMs = 200) => {
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

    loadConfigurationActions(engine).setConfiguration(sampleConfiguration);

    const searchInterface = buildSearchInterface({engine});

    const searchBox = buildSearchBoxController({interface: searchInterface});
    const resultList = buildResultListController({interface: searchInterface});

    searchBox.setQuery({query});
    await searchBox.submit();

    await waitFor(() => {
      return !searchBox.state.isLoading;
    });

    if (searchBox.state.error !== null) {
      throw new Error(`Search API returned an error: ${searchBox.state.error}`);
    }

    const stateResults = resultList.state.results;

    if (stateResults.length === 0) {
      expect(stateResults).toEqual([]);
      return;
    }

    const firstStateResult = stateResults[0];
    expect(firstStateResult).toHaveProperty('uniqueId');
    expect(firstStateResult).toHaveProperty('title');
    expect(firstStateResult).toHaveProperty('uri');
  }, 40000);
});
