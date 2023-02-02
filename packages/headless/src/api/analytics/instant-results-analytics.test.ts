import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {
  getInstantResultsInitialState,
  InstantResultCache,
} from '../../features/instant-results/instant-results-state';
import {
  InstantResultsAnalyticsProvider,
  StateNeededByInstantResultsAnalyticsProvider,
} from './instant-result-analytics';

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
  });

  it('should properly return getSearchUID from the instant results state if available', () => {
    const state = getBaseState();
    state.instantResults['someid'] = {
      q: 'somequery',
      cache: {
        someSuggestion: {
          ...makeEmptyCache(),
          isActive: true,
          searchUid: 'the_id',
        },
        anotherSuggestion: {
          ...makeEmptyCache(),
          isActive: false,
          searchUid: 'not_the_id',
        },
      },
    };

    expect(
      new InstantResultsAnalyticsProvider(() => state).getSearchUID()
    ).toEqual('the_id');
  });
});
