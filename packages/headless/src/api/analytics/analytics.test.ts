import {createMockState} from '../../test/mock-state';
import {
  AnalyticsProvider,
  configureAnalytics,
  StateNeededByAnalyticsProvider,
} from './analytics';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {getPipelineInitialState} from '../../features/pipeline/pipeline-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';

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
  describe('analytics provider', () => {
    const baseState: StateNeededByAnalyticsProvider = {
      configuration: getConfigurationInitialState(),
    };

    it('when context is not provided, #getBaseMetadata returns an empty object', () => {
      const provider = new AnalyticsProvider(baseState);
      expect(provider.getBaseMetadata()).toEqual({});
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
      expect(provider.getBaseMetadata()).toEqual({context_test: 'value'});
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
      expect(provider.getPipeline()).toEqual(getPipelineInitialState());
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
  });
});
