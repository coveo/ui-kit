import {CoveoAnalyticsClient} from 'coveo.analytics';
import {pino} from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state.js';
import {buildMockFacetRequest} from '../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../test/mock-facet-response.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../test/mock-facet-value.js';
import {buildMockFacetValueRequest} from '../../test/mock-facet-value-request.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildMockQueryState} from '../../test/mock-query-state.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  type StateNeededByInsightAnalyticsProvider,
} from './insight-analytics.js';

describe('insight analytics', () => {
  const logger = pino({level: 'silent'});

  it('should be enabled by default', () => {
    const state = buildMockInsightState();
    expect(
      configureInsightAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = buildMockInsightState();
    state.configuration.analytics.enabled = true;

    expect(
      configureInsightAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = buildMockInsightState();
    state.configuration.analytics.enabled = false;

    expect(
      configureInsightAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
    ).toBe(false);
  });

  describe('insight analytics provider', () => {
    const getBaseState = (): StateNeededByInsightAnalyticsProvider => ({
      configuration: getConfigurationInitialState(),
    });

    it('should properly return the pipeline from the state', () => {
      const state = getBaseState();
      state.pipeline = 'foo';
      expect(new InsightAnalyticsProvider(() => state).getPipeline()).toBe(
        'foo'
      );
    });

    it('should properly return the pipeline from the response if not available directly from state', () => {
      const state = getBaseState();
      state.pipeline = undefined;
      state.search = buildMockSearchState({});
      state.search.response.pipeline = 'foo';
      expect(new InsightAnalyticsProvider(() => state).getPipeline()).toBe(
        'foo'
      );
    });

    it('should return "default" if the pipeline is not available', () => {
      const state = getBaseState();
      state.pipeline = undefined;
      state.search = undefined;
      expect(new InsightAnalyticsProvider(() => state).getPipeline()).toBe(
        'default'
      );
    });

    it('should properly return facet state', () => {
      const state = getBaseState();
      state.facetSet = {
        the_facet: buildMockFacetSlice({
          request: buildMockFacetRequest({
            field: 'foo',
            currentValues: [buildMockFacetValueRequest({state: 'selected'})],
          }),
        }),
      };
      state.search = buildMockSearchState({});
      state.search.response.facets = [
        buildMockFacetResponse({
          field: 'foo',
          values: [buildMockFacetValue({state: 'selected'})],
        }),
      ];

      expect(
        new InsightAnalyticsProvider(() => state).getFacetState().length
      ).toBe(1);
      expect(
        new InsightAnalyticsProvider(() => state).getFacetState()[0].field
      ).toBe('foo');
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
        new InsightAnalyticsProvider(() => state).getSearchEventRequestPayload()
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
      expect(new InsightAnalyticsProvider(() => state).getSearchUID()).toEqual(
        'the_id'
      );
    });

    it('should properly return getSearchUID from response.searchUid if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.searchUid = 'another_id';
      expect(new InsightAnalyticsProvider(() => state).getSearchUID()).toEqual(
        'another_id'
      );
    });

    it('should properly return the generated answer metadata from the state', () => {
      const state = getBaseState();
      state.generatedAnswer = getGeneratedAnswerInitialState();
      state.generatedAnswer.isVisible = false;
      expect(
        new InsightAnalyticsProvider(() => state).getGeneratedAnswerMetadata()
      ).toEqual({showGeneratedAnswer: false});
    });
  });
});
