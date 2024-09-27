import {PactV3} from '@pact-foundation/pact';
import {describe, it, expect} from 'vitest';
import {
  providerFactory,
  addSuggestionInteraction,
} from '../../../pact-provider/provider.js';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine.js';
import {buildSearchBox, SearchBox} from './headless-search-box.js';

const getSearchBoxController = (url: string) => {
  const configuration = getSampleSearchEngineConfiguration();
  configuration.search!.proxyBaseUrl = url;
  const engine = buildSearchEngine({
    configuration,
    navigatorContextProvider: () => ({
      clientId: crypto.randomUUID(),
      location: 'some location',
      referrer: 'some referrer',
      userAgent: 'some user agent',
    }),
  });
  return buildSearchBox(engine);
};

describe('SearchBox', () => {
  let provider: PactV3;
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    provider = providerFactory();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when there are suggestions available', () => {
    beforeEach(() => {
      provider = addSuggestionInteraction(provider);
    });

    it('should return suggestions', async () => {
      await provider.executeTest(async (mockServer) => {
        const searchBox = getSearchBoxController(mockServer.url);
        searchBox.showSuggestions();
        await waitForNSubscribeCallback(searchBox, 2);
        expect(searchBox.state).toMatchSnapshot();
      });
    });
  });
});

async function waitForNSubscribeCallback(
  searchBox: SearchBox,
  subscribeThreshold: number
) {
  await new Promise<void>((resolve) => {
    let subscribeCount = 0;
    searchBox.subscribe(() => {
      if (++subscribeCount < subscribeThreshold) {
        return;
      }
      resolve();
    });
  });
}
