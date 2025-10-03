import {CoveoAnalyticsClient} from 'coveo.analytics';
import {pino} from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {getCategoryFacetSetInitialState} from '../../features/facets/category-facet-set/category-facet-set-state.js';
import {getFacetSetInitialState} from '../../features/facets/facet-set/facet-set-state.js';
import type {FacetSortCriterion} from '../../features/facets/facet-set/interfaces/request.js';
import type {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state.js';
import type {OmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions.js';
import {getQuerySuggestSetInitialState} from '../../features/query-suggest/query-suggest-state.js';
import type {StaticFilterValueMetadata} from '../../features/static-filter-set/static-filter-set-actions.js';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice.js';
import {buildMockFacetRequest} from '../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../test/mock-facet-response.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../test/mock-facet-value.js';
import {buildMockFacetValueRequest} from '../../test/mock-facet-value-request.js';
import {buildMockQueryState} from '../../test/mock-query-state.js';
import {buildMockQuerySuggestSet} from '../../test/mock-query-suggest-slice.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {createMockState} from '../../test/mock-state.js';
import type {QuerySuggestCompletion} from '../search/query-suggest/query-suggest-response.js';
import {
  configureLegacyAnalytics,
  getPageID,
  SearchAnalyticsProvider,
  type StateNeededBySearchAnalyticsProvider,
} from './search-analytics.js';

vi.mock('@coveo/relay');

const mockGetHistory = vi.fn();

vi.mock('./coveo.analytics/history-store.js', async () => {
  return {
    default: {
      getInstance: () => {
        return {
          getHistory: mockGetHistory,
        };
      },
    },
  };
});

describe('#configureLegacyAnalytics', () => {
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
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
    const getBaseState = (): StateNeededBySearchAnalyticsProvider => ({
      configuration,
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

    it('should properly return the facet metadata from the state', () => {
      const facetId = 'the_facet';
      const facetValue = 'the_value';
      const state = getBaseState();
      state.facetSet = getFacetSetInitialState();
      state.facetSet[facetId] = buildMockFacetSlice({});

      expect(
        new SearchAnalyticsProvider(() => state).getFacetMetadata(
          facetId,
          facetValue
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        facetField: state.facetSet[facetId].request.field,
        facetId,
        facetTitle: `${state.facetSet[facetId].request.field}_${facetId}`,
        facetValue,
      });
    });

    it('should properly return the facet clear all metadata from the state', () => {
      const facetId = 'the_facet';
      const state = getBaseState();
      state.facetSet = getFacetSetInitialState();
      state.facetSet[facetId] = buildMockFacetSlice({});

      expect(
        new SearchAnalyticsProvider(() => state).getFacetClearAllMetadata(
          facetId
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        facetField: state.facetSet[facetId].request.field,
        facetId,
        facetTitle: `${state.facetSet[facetId].request.field}_${facetId}`,
      });
    });

    it('should properly return the facet sort metadata from the state', () => {
      const facetId = 'the_facet';
      const criteria: FacetSortCriterion = 'score';
      const state = getBaseState();
      state.facetSet = getFacetSetInitialState();
      state.facetSet[facetId] = buildMockFacetSlice({});

      expect(
        new SearchAnalyticsProvider(() => state).getFacetUpdateSortMetadata(
          facetId,
          criteria
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        facetField: state.facetSet[facetId].request.field,
        facetId,
        facetTitle: `${state.facetSet[facetId].request.field}_${facetId}`,
        criteria,
      });
    });

    it('should properly return the range facet breadcrumb metadata from the state', () => {
      const facetId = 'the_facet';
      const facetValue: DateFacetValue = {
        start: '1',
        end: '10',
        endInclusive: false,
        state: 'selected',
        numberOfResults: 1,
      };
      const state = getBaseState();
      state.facetSet = getFacetSetInitialState();
      state.facetSet[facetId] = buildMockFacetSlice({});

      expect(
        new SearchAnalyticsProvider(
          () => state
        ).getRangeBreadcrumbFacetMetadata(facetId, facetValue)
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        facetField: state.facetSet[facetId].request.field,
        facetId,
        facetTitle: `${state.facetSet[facetId].request.field}_${facetId}`,
        facetRangeEnd: facetValue.end,
        facetRangeStart: facetValue.start,
        facetRangeEndInclusive: facetValue.endInclusive,
      });
    });

    it('should properly return the result sort metadata from the state', () => {
      const resultsSortBy = 'relevancy';
      const state = getBaseState();
      state.sortCriteria = resultsSortBy;

      expect(
        new SearchAnalyticsProvider(() => state).getResultSortMetadata()
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        resultsSortBy,
      });
    });

    it('should properly return the static filter toggle metadata from the state', () => {
      const staticFilterId = 'the_field';
      const staticFilterValue: StaticFilterValueMetadata = {
        caption: 'selected',
        expression: 'the_value',
      };
      const state = getBaseState();

      expect(
        new SearchAnalyticsProvider(() => state).getStaticFilterToggleMetadata(
          staticFilterId,
          staticFilterValue
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        staticFilterId,
        staticFilterValue,
      });
    });

    it('should properly return the undo trigger query metadata from the state', () => {
      const undoneQuery = 'the_query';
      const state = getBaseState();

      expect(
        new SearchAnalyticsProvider(() => state).getUndoTriggerQueryMetadata(
          undoneQuery
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        undoneQuery,
      });
    });

    it('should properly return the category facet breadcrumb metadata from the state', () => {
      const categoryFacetId = 'the_facet';
      const categoryFacetPath = ['the_value'];
      const state = getBaseState();
      state.categoryFacetSet = getCategoryFacetSetInitialState();
      state.categoryFacetSet[categoryFacetId] = buildMockCategoryFacetSlice({});

      expect(
        new SearchAnalyticsProvider(
          () => state
        ).getCategoryBreadcrumbFacetMetadata(categoryFacetId, categoryFacetPath)
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        categoryFacetField:
          state.categoryFacetSet[categoryFacetId].request.field,
        categoryFacetId,
        categoryFacetTitle: `${state.categoryFacetSet[categoryFacetId].request.field}_${categoryFacetId}`,
        categoryFacetPath,
      });
    });

    it('should properly return the omnibox analytics metadata from the state', () => {
      const id = 'the query suggest id';
      const suggestion = 'the suggestion';
      const partialQueries = ['the partial query', 'another partial query'];
      const completions: QuerySuggestCompletion[] = [
        {
          expression: 'the expression',
          highlighted: 'the highlighted',
          score: 1,
          executableConfidence: 1,
        },
        {
          expression: 'another expression',
          highlighted: 'another highlighted',
          score: 1,
          executableConfidence: 1,
        },
      ];
      const state = getBaseState();
      state.querySuggest = getQuerySuggestSetInitialState();
      state.querySuggest[id] = buildMockQuerySuggestSet({
        id,
        partialQueries,
        completions,
      });

      expect(
        new SearchAnalyticsProvider(() => state).getOmniboxAnalyticsMetadata(
          id,
          suggestion
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        partialQueries,
        partialQuery: partialQueries[partialQueries.length - 1],
        querySuggestResponseId: '',
        suggestionRanking: -1,
        suggestions: completions.map((completion) => completion.expression),
      });
    });

    it('should properly return the interface change metadata from the state', () => {
      const originLevel2 = 'the origin level 2';
      const state = getBaseState();
      state.configuration.analytics.originLevel2 = originLevel2;

      expect(
        new SearchAnalyticsProvider(() => state).getInterfaceChangeMetadata()
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        interfaceChangeTo: originLevel2,
      });
    });

    it('should properly return the omnibox from link metadata from the state', () => {
      const metadata: OmniboxSuggestionMetadata = {
        suggestionRanking: 1,
        partialQuery: 'partialQuery',
        partialQueries: 'partialQueries',
        suggestions: 'suggestions',
        querySuggestResponseId: 'querySuggestResponseId',
      };

      const state = getBaseState();

      expect(
        new SearchAnalyticsProvider(() => state).getOmniboxFromLinkMetadata(
          metadata
        )
      ).toEqual({
        coveoHeadlessVersion: 'Test version',
        ...metadata,
      });
    });

    describe('getBaseMetadata with Generative Answering ID', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it('should include generativeQuestionAnsweringId when available from answer service', () => {
        const mockState = {
          ...getBaseState(),
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            answerConfigurationId: 'test-config-id',
            answerId: 'my-answer-id',
          },
          answer: {
            data: {},
          },
        };

        const provider = new SearchAnalyticsProvider(() => mockState);
        const metadata = provider.getBaseMetadata();

        expect(metadata).toBeDefined();
        expect(metadata).toHaveProperty('generativeQuestionAnsweringId');
        expect(metadata.generativeQuestionAnsweringId).toBe('my-answer-id');
      });

      it('should include generativeQuestionAnsweringId from search response when the answerId is unavailable', () => {
        const stateWithSearchId = {
          ...getBaseState(),
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            answerConfigurationId: undefined, // No answer config
          },
          search: {
            ...buildMockSearchState({}),
            response: {
              ...buildMockSearchState({}).response,
              extendedResults: {
                generativeQuestionAnsweringId: 'search-response-id-456',
              },
            },
          },
        };

        const provider = new SearchAnalyticsProvider(() => stateWithSearchId);
        const metadata = provider.getBaseMetadata();

        expect(metadata).toBeDefined();
        expect(metadata).toHaveProperty('generativeQuestionAnsweringId');
      });

      it('should not include generativeQuestionAnsweringId when not available', () => {
        const stateWithoutIds = {
          ...getBaseState(),
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            answerConfigurationId: undefined,
          },
          search: {
            ...buildMockSearchState({}),
            response: {
              ...buildMockSearchState({}).response,
              extendedResults: {
                // N/A
              },
            },
          },
        };

        const provider = new SearchAnalyticsProvider(() => stateWithoutIds);
        const metadata = provider.getBaseMetadata();

        expect(metadata).toBeDefined();
        expect(metadata).toHaveProperty('coveoHeadlessVersion');
        expect(metadata).not.toHaveProperty('generativeQuestionAnsweringId');
      });

      it('should handle partial search states and still expose metadata properties', () => {
        const partialState = {
          ...getBaseState(),
          search: undefined,
        };

        const provider = new SearchAnalyticsProvider(() => partialState);
        const metadata = provider.getBaseMetadata();

        expect(metadata).toBeDefined();
        expect(metadata).toHaveProperty('coveoHeadlessVersion');
      });

      it('should preserve existing base metadata fields (version, context values) when generativeQuestionAnsweringId integration is added', () => {
        const stateWithContext = {
          ...getBaseState(),
          context: {
            contextValues: {
              customKey: 'customValue',
              multiValue: ['value1', 'value2'],
            },
          },
          search: {
            ...buildMockSearchState({}),
            response: {
              ...buildMockSearchState({}).response,
              extendedResults: {
                generativeQuestionAnsweringId: 'search-response-id-456',
              },
            },
          },
        };

        const provider = new SearchAnalyticsProvider(() => stateWithContext);
        const metadata = provider.getBaseMetadata();

        expect(metadata).toHaveProperty('coveoHeadlessVersion');
        expect(metadata).toHaveProperty('generativeQuestionAnsweringId');

        expect(metadata).toHaveProperty('context_customKey', 'customValue');
        expect(metadata).toHaveProperty('context_multiValue', [
          'value1',
          'value2',
        ]);
      });
    });
  });
});
