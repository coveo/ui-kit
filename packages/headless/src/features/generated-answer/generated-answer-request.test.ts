import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import {buildMockNavigatorContextProvider} from '../../test/mock-navigator-context-provider.js';
import {
  expectedStreamAnswerAPIParam,
  streamAnswerAPIStateMock,
  streamAnswerAPIStateMockWithAnalyticsEnabled,
  streamAnswerAPIStateMockWithATabWithAnExpression,
  streamAnswerAPIStateMockWithCaseContextIncluded,
  streamAnswerAPIStateMockWithDebugFalse,
  streamAnswerAPIStateMockWithDebugTrue,
  streamAnswerAPIStateMockWithDebugUndefined,
  streamAnswerAPIStateMockWithDictionaryFieldContext,
  streamAnswerAPIStateMockWithExcerptLength,
  streamAnswerAPIStateMockWithFieldsToInclude,
  streamAnswerAPIStateMockWithFoldingDisabled,
  streamAnswerAPIStateMockWithFoldingEnabled,
  streamAnswerAPIStateMockWithLegacyDidYouMean,
  streamAnswerAPIStateMockWithNextDidYouMeanAutoCorrect,
  streamAnswerAPIStateMockWithNextDidYouMeanNoAutoCorrect,
  streamAnswerAPIStateMockWithNonValidFilters,
  streamAnswerAPIStateMockWithoutAnyFacets,
  streamAnswerAPIStateMockWithoutAnyFilters,
  streamAnswerAPIStateMockWithoutAnyTab,
  streamAnswerAPIStateMockWithoutContext,
  streamAnswerAPIStateMockWithoutFields,
  streamAnswerAPIStateMockWithoutSearchAction,
  streamAnswerAPIStateMockWithQuerySyntaxEnabled,
  streamAnswerAPIStateMockWithSortableFacets,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
  streamAnswerAPIStateMockWithStaticFiltersSelected,
} from './generated-answer-mocks.js';
import {constructAnswerAPIQueryParams} from './generated-answer-request.js';

describe('constructAnswerAPIQueryParams', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  describe('basic query construction', () => {
    it('returns the correct query params with fetch usage', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });
  });

  describe('tab expression handling', () => {
    it('should merge tab expression in request constant query when expression is not a blank string', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithATabWithAnExpression,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        cq: 'cq-test-query AND @fileType=html',
        tab: 'default',
      });
    });

    it('should default to the default tab when there is NO tab specified', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutAnyTab,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        tab: 'default',
      });
    });
  });

  describe('filter expression handling', () => {
    it('should merge filter expressions in request constant query when expression is selected', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersSelected,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        cq: 'cq-test-query AND @filetype=="youtubevideo"',
      });
    });

    it('should not include filter info when there is NO filter', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutAnyFilters,
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should not include non-selected filters and empty filters', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithNonValidFilters,
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should merge multiple filter expressions and a tab expression', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toMatchObject({
        cq: 'cq-test-query AND @fileType=html AND (@filetype=="youtubevideo" OR @filetype=="dropbox") AND @filetype=="tsx"',
      });
    });
  });

  describe('advanced search query handling', () => {
    it('should not include advanced search queries when there are no advanced search queries', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toMatchObject({
        cq: '@fileType=html AND (@filetype=="youtubevideo" OR @filetype=="dropbox") AND @filetype=="tsx"',
      });
    });
  });

  describe('analytics parameter handling', () => {
    it('should accept an undefined SearchAction', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutSearchAction,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        analytics: {
          actionCause: '',
        },
      });
    });

    it('should include all analytics fields when usage is fetch', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.analytics).toBeDefined();
      expect(queryParams.analytics?.clientTimestamp).toBeDefined();
      expect(queryParams.analytics?.actionCause).toBeDefined();
      expect(queryParams.analytics?.capture).toBeDefined();
      expect(queryParams.analytics?.clientId).toBeDefined();
      expect(queryParams.analytics?.originContext).toBeDefined();
      expect(queryParams.analytics?.source).toBeDefined();
    });

    it('should include actionsHistory when analytics are enabled and history is present', () => {
      const history = [
        {name: 'search', value: 'some query', time: new Date().toISOString()},
        {name: 'click', value: 'some uri', time: new Date().toISOString()},
      ];
      const mockHistoryStore: Pick<HistoryStore, 'getHistory'> = {
        getHistory: vi.fn(() => history),
      };
      vi.spyOn(HistoryStore, 'getInstance').mockReturnValue(
        mockHistoryStore as HistoryStore
      );

      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithAnalyticsEnabled,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.actionsHistory).toEqual(history);
      expect(queryParams.actionsHistory?.length).toBe(2);
    });
  });

  describe('referrer handling', () => {
    it('should include empty string referrer when there is NO referrer', () => {
      const navigatorContext = buildMockNavigatorContextProvider();
      const context = navigatorContext();
      context.referrer = null;

      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        context
      );

      expect(queryParams).toMatchObject({
        referrer: '',
        analytics: {
          documentReferrer: null,
        },
      });
    });
  });

  describe('folding parameter handling', () => {
    it('should not include folding params when folding is disabled', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithFoldingDisabled,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        filterField: '',
        childField: '',
        parentField: '',
        filterFieldRange: 0,
      });
    });

    it('should include folding params when folding is enabled', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithFoldingEnabled,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        filterField: 'testCollection',
        childField: 'testParent',
        parentField: 'testChild',
        filterFieldRange: 1,
      });
    });
  });

  describe('optional parameter handling', () => {
    it('should include excerptLength when it is set in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithExcerptLength,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        excerptLength: 300,
      });
    });

    it('should include dictionaryFieldContext when it has context values', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithDictionaryFieldContext,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        dictionaryFieldContext: {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });

    it('should correctly set enableQuerySyntax when set in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithQuerySyntaxEnabled,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        enableQuerySyntax: true,
      });
    });

    it('should correctly set locale and timezone when set in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.locale).toEqual('en');
      expect(queryParams.timezone).toEqual('America/New_York');
    });

    it('should include fieldsToInclude when fields state is present', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithFieldsToInclude,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.fieldsToInclude).toEqual([
        'title',
        'summary',
        'uri',
        'author',
      ]);
    });

    it('should not include fieldsToInclude when fields state is undefined', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutFields,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.fieldsToInclude).toBeUndefined();
    });
  });

  describe('context parameter handling', () => {
    it('should correctly set case context when set in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithCaseContextIncluded,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toMatchObject({
        caseContext: {caseSubject: 'foo', caseDescription: 'bar'},
      });
    });

    it('should not set case context when not included in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.caseContext).toBeUndefined();
    });

    it('should correctly set custom context when set in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.context).toMatchObject({
        testKey: 'testValue',
      });
    });

    it('should not set custom context when not included in state', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutContext,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.context).toBeUndefined();
    });
  });

  describe('required field validation', () => {
    it('should always include required pipeline rule parameters', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.pipelineRuleParameters).toBeDefined();
      expect(
        queryParams.pipelineRuleParameters?.mlGenerativeQuestionAnswering
      ).toBeDefined();
      expect(
        queryParams.pipelineRuleParameters?.mlGenerativeQuestionAnswering
          ?.responseFormat
      ).toBeDefined();
      expect(
        queryParams.pipelineRuleParameters?.mlGenerativeQuestionAnswering
          ?.citationsFieldToInclude
      ).toBeDefined();
    });

    it('should always include required navigation context fields', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.referrer).toBeDefined();
      expect(queryParams.actionsHistory).toBeDefined();
    });

    it('should always include required sort criteria', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.sortCriteria).toBeDefined();
    });

    it('should always include required pagination fields', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.numberOfResults).toBeDefined();
      expect(queryParams.firstResult).toBeDefined();
    });

    it('should always include facetOptions field', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMock,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.facetOptions).toBeDefined();
    });
  });

  describe('diYouMean parameter handling', () => {
    it('should include legacy didYouMean when using legacy mode', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithLegacyDidYouMean,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.enableDidYouMean).toBe(true);
      expect(queryParams.queryCorrection?.enabled).toBe(false);
    });

    it('should include next didYouMean params when using next mode', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithNextDidYouMeanAutoCorrect,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.queryCorrection?.enabled).toBe(true);
      expect(queryParams.queryCorrection?.options?.automaticallyCorrect).toBe(
        'whenNoResults'
      );
      expect(queryParams.enableDidYouMean).toBe(false);
    });

    it('should set automaticallyCorrectQuery to "never" when in next mode', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithNextDidYouMeanNoAutoCorrect,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.queryCorrection?.options?.automaticallyCorrect).toBe(
        'never'
      );
    });
  });

  describe('debug parameter handling', () => {
    it('should include debug parameter when set to true', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithDebugTrue,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.debug).toBe(true);
    });

    it('should include debug parameter when set to false', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithDebugFalse,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.debug).toBe(false);
    });

    it('should not include debug parameter when undefined', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithDebugUndefined,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.debug).toBeUndefined();
    });
  });

  describe('facet parameter handling', () => {
    it('should sort facets by facetId alphabetically', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithSortableFacets,
        buildMockNavigatorContextProvider()()
      );

      const facetIds = queryParams.facets?.map((f) => f.facetId);
      expect(facetIds).toEqual(['alpha-facet', 'beta-facet', 'zebra-facet']);
    });

    it('should handle empty facetSet', () => {
      const queryParams = constructAnswerAPIQueryParams(
        streamAnswerAPIStateMockWithoutAnyFacets,
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams.facets).toBeUndefined();
    });
  });
});
