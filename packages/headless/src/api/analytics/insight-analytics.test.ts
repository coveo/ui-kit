import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockQueryState} from '../../test/mock-query-state';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
} from './insight-analytics';

describe('insight analytics', () => {
  const logger = pino({level: 'silent'});

  it('should be enabled by default', () => {
    const state = buildMockInsightState();
    expect(
      configureInsightAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = buildMockInsightState();
    state.configuration.analytics.enabled = true;

    expect(
      configureInsightAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = buildMockInsightState();
    state.configuration.analytics.enabled = false;

    expect(
      configureInsightAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(false);
  });

  describe('search analytics provider', () => {
    const getBaseState = (): StateNeededByInsightAnalyticsProvider => ({
      configuration: getConfigurationInitialState(),
    });

    it('should properly return the pipeline from the state', () => {
      const state = getBaseState();
      state.pipeline = 'foo';
      expect(new InsightAnalyticsProvider(state).getPipeline()).toBe('foo');
    });

    it('should properly return the pipeline from the reponse if not available directly from state', () => {
      const state = getBaseState();
      state.pipeline = undefined;
      state.search = buildMockSearchState({});
      state.search.response.pipeline = 'foo';
      expect(new InsightAnalyticsProvider(state).getPipeline()).toBe('foo');
    });

    it('should properly return facet state', () => {
      const state = getBaseState();
      state.facetSet = {the_facet: buildMockFacetRequest({field: 'foo'})};
      state.search = buildMockSearchState({});
      state.search.response.facets = [
        buildMockFacetResponse({
          field: 'foo',
          values: [buildMockFacetValue({state: 'selected'})],
        }),
      ];

      expect(new InsightAnalyticsProvider(state).getFacetState()[0].field).toBe(
        'foo'
      );
    });

    it('should properly return getSearchEventRequestPayload', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.results = [
        buildMockResult(),
        buildMockResult(),
        buildMockResult(),
      ];
      state.query = buildMockQueryState({q: 'foo'});
      expect(
        new InsightAnalyticsProvider(state).getSearchEventRequestPayload()
      ).toMatchObject({
        queryText: 'foo',
        responseTime: 0,
        results: expect.any(Array),
        numberOfResults: 3,
      });
    });

    it('should properly return getSearchUID from searchResponseId if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({searchResponseId: 'the_id'});
      state.search.response.searchUid = 'another_id';
      expect(new InsightAnalyticsProvider(state).getSearchUID()).toEqual(
        'the_id'
      );
    });

    it('should properly return getSearchUID from response.searchUid if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.searchUid = 'another_id';
      expect(new InsightAnalyticsProvider(state).getSearchUID()).toEqual(
        'another_id'
      );
    });
  });
});
