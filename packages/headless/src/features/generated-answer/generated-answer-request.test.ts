import {
  expectedStreamAnswerAPIParam,
  expectedStreamAnswerAPIParamWithATabWithAnExpression,
  expectedStreamAnswerAPIParamWithDifferentFacetTimes,
  expectedStreamAnswerAPIParamWithoutAnyTab,
  expectedStreamAnswerAPIParamWithoutSearchAction,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ,
  expectedStreamAnswerAPIParamWithStaticFiltersSelected,
  streamAnswerAPIStateMock,
  streamAnswerAPIStateMockWithATabWithAnExpression,
  streamAnswerAPIStateMockWithNonValidFilters,
  streamAnswerAPIStateMockWithoutAnyFilters,
  streamAnswerAPIStateMockWithoutAnyTab,
  streamAnswerAPIStateMockWithoutSearchAction,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
  streamAnswerAPIStateMockWithStaticFiltersSelected,
} from '../../controllers/knowledge/generated-answer/headless-answerapi-generated-answer-mocks.js';
import {buildMockNavigatorContextProvider} from '../../test/mock-navigator-context-provider.js';
import {constructAnswerAPIQueryParams} from './generated-answer-request.js';

describe('constructAnswerAPIQueryParams', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns the correct query params with fetch usage', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMock,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
  });

  it('should merge tab expression in request constant query when expression is not a blank string', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMockWithATabWithAnExpression,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithATabWithAnExpression
    );
  });

  it('should not include tab info when there is NO tab', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMockWithoutAnyTab,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParamWithoutAnyTab);
  });

  it('should merge filter expressions in request constant query when expression is selected', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMockWithStaticFiltersSelected,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersSelected
    );
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
    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression
    );
  });

  it('should not include advanced search queries when there are no advanced search queries', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
      buildMockNavigatorContextProvider()()
    );
    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ
    );
  });

  it('should accept an undefined SearchAction', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMockWithoutSearchAction,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithoutSearchAction
    );
  });

  it('should include all analytics fields when usage is fetch', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMock,
      buildMockNavigatorContextProvider()()
    );

    // Verify that all analytics fields are present including volatile ones
    expect(queryParams.analytics).toBeDefined();
    expect(queryParams.analytics?.clientTimestamp).toBeDefined();
    expect(queryParams.analytics?.actionCause).toBeDefined();
    expect(queryParams.analytics?.capture).toBeDefined();
    expect(queryParams.analytics?.clientId).toBeDefined();
    expect(queryParams.analytics?.originContext).toBeDefined();
  });

  it('should build the correct facets times for the query params', () => {
    const queryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMock,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);

    const updatedQueryParams = constructAnswerAPIQueryParams(
      streamAnswerAPIStateMock,
      buildMockNavigatorContextProvider()()
    );

    expect(updatedQueryParams).not.toEqual(
      expectedStreamAnswerAPIParamWithDifferentFacetTimes
    );
  });
});
