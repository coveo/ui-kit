const mockGetHistory = jest.fn();
import {createMockState} from '../../test/mock-state';
import {
  AnalyticsProvider,
  configureAnalytics,
  getPageID,
  StateNeededByAnalyticsProvider,
} from './analytics';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {getProductListingInitialState} from '../../features/product-listing/product-listing-state';
import {buildMockProductListingState} from '../../test/mock-product-listing-state';

jest.mock('coveo.analytics', () => {
  const originalModule = jest.requireActual('coveo.analytics');
  return {
    ...originalModule,
    history: {
      HistoryStore: jest.fn().mockImplementation(() => {
        return {
          getHistory: mockGetHistory,
        };
      }),
    },
  };
});

describe('analytics', () => {
  const logger = pino({level: 'silent'});
  it('should be enabled by default', () => {
    const state = createMockState();
    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = true;

    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = false;
    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(false);
  });

  it('should extract pageId from last page view in action history', () => {
    [
      {
        in: [
          {name: 'PageView', value: 'foo'},
          {name: 'PageView', value: 'bar'},
        ],
        out: 'bar',
      },
      {
        in: [
          {name: 'PageView', value: 'foo'},
          {name: 'not a page view', value: 'qwerty'},
          {name: 'PageView', value: 'bar'},
          {name: 'not a page view', value: 'azerty'},
        ],
        out: 'bar',
      },
      {
        in: [],
        out: '',
      },
      {
        in: [
          {name: 'not a page view', value: 'qwerty'},
          {name: 'not a page view', value: 'azerty'},
        ],
        out: '',
      },
      {
        in: [
          {name: 'pageview', value: 'qwerty'},
          {name: 'pageView', value: 'azerty'},
        ],
        out: '',
      },
    ].forEach((expectation) => {
      mockGetHistory.mockReturnValueOnce(expectation.in);
      expect(getPageID()).toEqual(expectation.out);
    });
  });

  describe('analytics provider', () => {
    const baseState: StateNeededByAnalyticsProvider = {
      configuration: getConfigurationInitialState(),
    };

    it('when context is not provided, #getBaseMetadata returns an object with version', () => {
      const provider = new AnalyticsProvider(baseState);
      expect(provider.getBaseMetadata()).toEqual({
        coveoHeadlessVersion: expect.any(String),
      });
    });

    it('when context is provided, #getBaseMetadata returns the correct object', () => {
      const state = {
        ...baseState,
        context: {
          contextValues: {
            test: 'value',
          },
        },
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getBaseMetadata()).toEqual({
        context_test: 'value',
        coveoHeadlessVersion: expect.any(String),
      });
    });

    it('when search is not provided, #getSearchUID returns the default id', () => {
      const provider = new AnalyticsProvider(baseState);
      expect(provider.getSearchUID()).toBe(
        getSearchInitialState().response.searchUid
      );
    });

    it('when search is provided, #getSearchUID returns the correct id', () => {
      const searchUid = 'test';
      const state = {
        ...baseState,
        search: buildMockSearchState({
          response: buildMockSearchResponse({
            searchUid,
          }),
        }),
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getSearchUID()).toEqual(searchUid);
    });

    it('when search pipeline is not provided, #getSearchPipeline returns the default pipeline', () => {
      const provider = new AnalyticsProvider(baseState);
      expect(provider.getPipeline()).toEqual('default');
    });

    it('when search pipeline is not provided, #getSearchPipeline returns pipeline from the API response if available', () => {
      const state = {
        ...baseState,
        search: buildMockSearchState({}),
      };
      state.search.response.pipeline = 'some-pipeline';
      const provider = new AnalyticsProvider(state);
      expect(provider.getPipeline()).toEqual('some-pipeline');
    });

    it('when search pipeline is provided, #getSearchPipeline returns the correct pipeline', () => {
      const pipeline = 'test';
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
        pipeline,
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getPipeline()).toEqual(pipeline);
    });

    it('when facets are provided, #getFacetState returns the facet state', () => {
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
        search: {
          ...getSearchInitialState(),
          response: buildMockSearchResponse({
            facets: [
              buildMockFacetResponse({
                values: [
                  {numberOfResults: 1, value: 'helloooo', state: 'selected'},
                ],
              }),
            ],
          }),
        },
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getFacetState().length).toBe(1);
    });

    it('when facets are not provided, #getFacetState returns an empty facet state', () => {
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getFacetState()).toEqual([]);
    });

    it('when a searchHub is not provided, #getOriginLevel1 returns the default searchHub', () => {
      const provider = new AnalyticsProvider(baseState);
      expect(provider.getOriginLevel1()).toEqual(getSearchHubInitialState());
    });

    it('when a searchHub is provided, #getOriginLevel1 returns the correct value', () => {
      const searchHub = 'test';
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
        searchHub,
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getOriginLevel1()).toEqual(searchHub);
    });

    describe('#getOriginContext', () => {
      it('when an originContext is not set, #getOriginContext returns "Search"', () => {
        const state: StateNeededByAnalyticsProvider = {
          configuration: getConfigurationInitialState(),
        };
        const provider = new AnalyticsProvider(state);

        expect(provider.getOriginContext()).toBe('Search');
      });

      it('when an originContext is set, #originContext returns the value', () => {
        const originContext = 'CommunitySearch';
        const state: StateNeededByAnalyticsProvider = {
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({originContext}),
          },
        };

        const provider = new AnalyticsProvider(state);

        expect(provider.getOriginContext()).toBe(originContext);
      });
    });

    describe('#getOriginLevel2', () => {
      it('when an originLevel2 is not set, #getOriginLevel2 returns "default"', () => {
        const state: StateNeededByAnalyticsProvider = {
          configuration: getConfigurationInitialState(),
        };
        const provider = new AnalyticsProvider(state);

        expect(provider.getOriginLevel2()).toBe('default');
      });

      it('when an originLevel2 is set, #getOriginLevel2 returns the value', () => {
        const originLevel2 = 'youtube';
        const state: StateNeededByAnalyticsProvider = {
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({originLevel2}),
          },
        };

        const provider = new AnalyticsProvider(state);

        expect(provider.getOriginLevel2()).toBe(originLevel2);
      });
    });

    it('when a locale search parameter is configured, #getLanguage returns the correct value', () => {
      const locale = 'fr-CA';
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
        configuration: {
          ...getConfigurationInitialState(),
          search: {...getConfigurationInitialState().search, locale},
        },
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getLanguage()).toEqual('fr');
    });

    it('when a locale search parameter is configured to something invalid, #getLanguage returns the correct value', () => {
      const locale = 'thisWillBlowUp';
      const state: StateNeededByAnalyticsProvider = {
        ...baseState,
        configuration: {
          ...getConfigurationInitialState(),
          search: {...getConfigurationInitialState().search, locale},
        },
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getLanguage()).toEqual('en');
    });

    it('when productListing is provided, #getSearchUID returns the correct id', () => {
      const searchUid = 'test';
      const state = {
        ...baseState,
        productListing: {
          ...getProductListingInitialState(),
          responseId: searchUid,
        },
      };
      const provider = new AnalyticsProvider(state);
      expect(provider.getSearchUID()).toEqual(searchUid);
    });

    it('when facets for productListing are provided, #getFacetState returns the facet state', () => {
      const state = buildMockProductListingState({
        productListing: {
          ...getProductListingInitialState(),
          facets: {
            results: [
              buildMockFacetResponse({
                values: [
                  {numberOfResults: 1, value: 'helloooo', state: 'selected'},
                ],
              }),
            ],
          },
        },
      });
      const provider = new AnalyticsProvider(state);
      expect(provider.getFacetState().length).toBe(1);
    });
  });
});
