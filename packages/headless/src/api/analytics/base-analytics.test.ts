import type {SearchEventRequest} from 'coveo.analytics/dist/definitions/events.js';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {
  BaseAnalyticsProvider,
  type StateNeededByBaseAnalyticsProvider,
} from './base-analytics.js';

class TestProvider extends BaseAnalyticsProvider<StateNeededByBaseAnalyticsProvider> {
  public getPipeline(): string {
    return '';
  }
  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: '',
      responseTime: 123,
      results: [],
      numberOfResults: 0,
    };
  }

  public getSearchUID(): string {
    return '';
  }
}

describe('base analytics provider', () => {
  const configuration = getConfigurationInitialState();
  configuration.analytics.analyticsMode = 'legacy';
  const baseState: StateNeededByBaseAnalyticsProvider = {
    configuration,
  };

  it('when analyticMode=next, #getBaseMetadata returns an object without coveoHeadlessVersion', () => {
    const state: StateNeededByBaseAnalyticsProvider = {
      ...baseState,
      configuration: {
        ...baseState.configuration,
        analytics: buildMockAnalyticsState({analyticsMode: 'next'}),
      },
    };
    const provider = new TestProvider(() => state);
    expect(provider.getBaseMetadata()).not.toHaveProperty(
      'coveoHeadlessVersion'
    );
  });

  it('when analyticMode=legacy, #getBaseMetadata returns an object with coveoHeadlessVersion', () => {
    const provider = new TestProvider(() => baseState);
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
    const provider = new TestProvider(() => state);
    expect(provider.getBaseMetadata()).toEqual({
      context_test: 'value',
      coveoHeadlessVersion: expect.any(String),
    });
  });

  it('when a searchHub is not provided, #getOriginLevel1 returns the default searchHub', () => {
    const provider = new TestProvider(() => baseState);
    expect(provider.getOriginLevel1()).toEqual(getSearchHubInitialState());
  });

  it('when a searchHub is provided, #getOriginLevel1 returns the correct value', () => {
    const searchHub = 'test';
    const state: StateNeededByBaseAnalyticsProvider = {
      ...baseState,
      searchHub,
    };
    const provider = new TestProvider(() => state);
    expect(provider.getOriginLevel1()).toEqual(searchHub);
  });

  describe('#getOriginContext', () => {
    it('when an originContext is not set, #getOriginContext returns "Search"', () => {
      const state: StateNeededByBaseAnalyticsProvider = {
        configuration: getConfigurationInitialState(),
      };
      const provider = new TestProvider(() => state);

      expect(provider.getOriginContext()).toBe('Search');
    });

    it('when an originContext is set, #originContext returns the value', () => {
      const originContext = 'CommunitySearch';
      const state: StateNeededByBaseAnalyticsProvider = {
        configuration: {
          ...getConfigurationInitialState(),
          analytics: buildMockAnalyticsState({originContext}),
        },
      };

      const provider = new TestProvider(() => state);

      expect(provider.getOriginContext()).toBe(originContext);
    });
  });

  describe('#getOriginLevel2', () => {
    it('when an originLevel2 is not set, #getOriginLevel2 returns "default"', () => {
      const state: StateNeededByBaseAnalyticsProvider = {
        configuration: getConfigurationInitialState(),
      };
      const provider = new TestProvider(() => state);

      expect(provider.getOriginLevel2()).toBe('default');
    });

    it('when an originLevel2 is set, #getOriginLevel2 returns the value', () => {
      const originLevel2 = 'youtube';
      const state: StateNeededByBaseAnalyticsProvider = {
        configuration: {
          ...getConfigurationInitialState(),
          analytics: buildMockAnalyticsState({originLevel2}),
        },
      };

      const provider = new TestProvider(() => state);

      expect(provider.getOriginLevel2()).toBe(originLevel2);
    });
  });

  it('when a locale search parameter is configured, #getLanguage returns the correct value', () => {
    const locale = 'fr-CA';
    const state: StateNeededByBaseAnalyticsProvider = {
      ...baseState,
      configuration: {
        ...getConfigurationInitialState(),
        search: {...getConfigurationInitialState().search, locale},
      },
    };
    const provider = new TestProvider(() => state);
    expect(provider.getLanguage()).toEqual('fr');
  });

  it('when a locale search parameter is configured to something invalid, #getLanguage returns the correct value', () => {
    const locale = 'thisWillBlowUp';
    const state: StateNeededByBaseAnalyticsProvider = {
      ...baseState,
      configuration: {
        ...getConfigurationInitialState(),
        search: {...getConfigurationInitialState().search, locale},
      },
    };
    const provider = new TestProvider(() => state);
    expect(provider.getLanguage()).toEqual('en');
  });
});
