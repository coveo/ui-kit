import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state';
import {buildMockResult, createMockState} from '../../test';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockFacetValueRequest} from '../../test/mock-facet-value-request';
import {buildMockQueryState} from '../../test/mock-query-state';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  configureLegacyAnalytics,
  getPageID,
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from './search-analytics';

const mockGetHistory = jest.fn();

jest.mock('coveo.analytics', () => {
  const originalModule = jest.requireActual('coveo.analytics');
  return {
    ...originalModule,
    history: {
      HistoryStore: jest.fn().mockImplementation(() => {
        return {
          getHistory: () => mockGetHistory(),
        };
      }),
    },
  };
});

describe('search analytics', () => {
  const logger = pino({level: 'silent'});
  it('should be enabled by default', () => {
    const state = createMockState();
    expect(
      configureLegacyAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = true;

    expect(
      configureLegacyAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = false;
    expect(
      configureLegacyAnalytics({getState: () => state, logger})
        .coveoAnalyticsClient instanceof CoveoAnalyticsClient
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

  describe('search analytics provider', () => {
    const getBaseState = (): StateNeededBySearchAnalyticsProvider => ({
      configuration: getConfigurationInitialState(),
    });

    it('should properly return the pipeline from the state', () => {
      const state = getBaseState();
      state.pipeline = 'foo';
      expect(new SearchAnalyticsProvider(() => state).getPipeline()).toBe(
        'foo'
      );
    });

    it('should properly return the pipeline from the response if not available directly from state', () => {
      const state = getBaseState();
      state.pipeline = undefined;
      state.search = buildMockSearchState({});
      state.search.response.pipeline = 'foo';
      expect(new SearchAnalyticsProvider(() => state).getPipeline()).toBe(
        'foo'
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
        new SearchAnalyticsProvider(() => state).getFacetState()[0].field
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
      state.search.response.totalCountFiltered = 1234;
      state.query = buildMockQueryState({q: 'foo'});
      expect(
        new SearchAnalyticsProvider(() => state).getSearchEventRequestPayload()
      ).toMatchObject({
        queryText: 'foo',
        responseTime: 0,
        results: expect.any(Array),
        numberOfResults: 1234,
      });
    });

    it('should properly return getSearchUID from searchResponseId if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({searchResponseId: 'the_id'});
      state.search.response.searchUid = 'another_id';
      expect(new SearchAnalyticsProvider(() => state).getSearchUID()).toEqual(
        'the_id'
      );
    });

    it('should properly return getSearchUID from response.searchUid if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.searchUid = 'another_id';
      expect(new SearchAnalyticsProvider(() => state).getSearchUID()).toEqual(
        'another_id'
      );
    });

    it('should return an undefined getSplitTestRunVersion if there is no splitTestRunName', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.splitTestRun = '';
      expect(
        new SearchAnalyticsProvider(() => state).getSplitTestRunVersion()
      ).toBeUndefined();
    });

    it('should return getSplitTestRunVersion from the pipeline search response if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.splitTestRun = 'foo';
      state.search.response.pipeline = 'pipeline-from-response';
      state.pipeline = 'pipeline-from-state';
      expect(
        new SearchAnalyticsProvider(() => state).getSplitTestRunVersion()
      ).toBe('pipeline-from-response');
    });

    it('should return getSplitTestRunVersion from the pipeline state value if there is no pipeline available in the search response', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.splitTestRun = 'foo';
      state.search.response.pipeline = '';
      state.pipeline = 'pipeline-from-state';
      expect(
        new SearchAnalyticsProvider(() => state).getSplitTestRunVersion()
      ).toBe('pipeline-from-state');
    });

    it('should properly return the generated answer metadata from the state', () => {
      const state = getBaseState();
      state.generatedAnswer = getGeneratedAnswerInitialState();
      state.generatedAnswer.isVisible = false;
      expect(
        new SearchAnalyticsProvider(() => state).getGeneratedAnswerMetadata()
      ).toEqual({showGeneratedAnswer: false});
    });
  });
});
