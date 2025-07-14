import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {
  getInstantResultsInitialState,
  type InstantResultCache,
} from '../../features/instant-results/instant-results-state.js';
import {buildMockResult} from '../../test/mock-result.js';
import {getObjectHash} from '../../utils/utils.js';
import {
  InstantResultsAnalyticsProvider,
  type StateNeededByInstantResultsAnalyticsProvider,
} from './instant-result-analytics.js';

describe('instant results analytics provider', () => {
  const getBaseState = (): StateNeededByInstantResultsAnalyticsProvider => ({
    configuration: getConfigurationInitialState(),
    instantResults: getInstantResultsInitialState(),
  });

  const makeEmptyCache: () => InstantResultCache = () => ({
    isLoading: true,
    error: null,
    results: [],
    expiresAt: 0,
    isActive: false,
    searchUid: '',
    totalCountFiltered: 0,
    duration: 0,
  });

  describe('with an active suggestion', () => {
    const activeSuggestionCache: InstantResultCache = {
      ...makeEmptyCache(),
      isActive: true,
      searchUid: 'the_id',
      duration: 123,
      results: [
        buildMockResult({
          uri: 'result/1',
          raw: {urihash: getObjectHash('result/1')},
        }),
        buildMockResult({
          uri: 'result/2',
          raw: {urihash: getObjectHash('result/2')},
        }),
      ],
    };
    let provider: InstantResultsAnalyticsProvider;
    beforeEach(() => {
      const state = getBaseState();
      state.instantResults.someid = {
        q: 'somequery',
        cache: {
          someSuggestion: activeSuggestionCache,
          anotherSuggestion: {
            ...makeEmptyCache(),
            isActive: false,
            searchUid: 'not_the_id',
          },
        },
      };
      provider = new InstantResultsAnalyticsProvider(() => state);
    });

    it('should properly return getSearchUID from the instant results state if available', () => {
      expect(provider.getSearchUID()).toEqual('the_id');
    });

    it('should generate the correct event request payload', () => {
      expect(provider.getSearchEventRequestPayload()).toEqual({
        queryText: 'somequery',
        responseTime: activeSuggestionCache.duration,
        results: [
          {
            documentUri: activeSuggestionCache.results[0].uri,
            documentUriHash: activeSuggestionCache.results[0].raw.urihash,
          },
          {
            documentUri: activeSuggestionCache.results[1].uri,
            documentUriHash: activeSuggestionCache.results[1].raw.urihash,
          },
        ],
        numberOfResults: activeSuggestionCache.totalCountFiltered,
      });
    });
  });
});
