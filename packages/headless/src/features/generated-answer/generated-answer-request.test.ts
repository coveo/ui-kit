/** biome-ignore-all lint/suspicious/noExplicitAny: Just tests */

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
import {constructAnswerQueryParams} from './generated-answer-request.js';

describe('constructAnswerQueryParams', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns the correct query params with fetch usage', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMock as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
  });

  it('should merge tab expression in request constant query when expression is not a blank string', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithATabWithAnExpression as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithATabWithAnExpression
    );
  });

  it('should not include tab info when there is NO tab', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithoutAnyTab as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParamWithoutAnyTab);
  });

  it('should merge filter expressions in request constant query when expression is selected', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithStaticFiltersSelected as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersSelected
    );
  });

  it('should not include filter info when there is NO filter', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithoutAnyFilters as any,
      buildMockNavigatorContextProvider()()
    );
    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
  });

  it('should not include non-selected filters and empty filters', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithNonValidFilters as any,
      buildMockNavigatorContextProvider()()
    );
    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
  });

  it('should merge multiple filter expressions and a tab expression', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithStaticFiltersAndTabExpression as any,
      buildMockNavigatorContextProvider()()
    );
    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression
    );
  });

  it('should not include advanced search queries when there are no advanced search queries', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ as any,
      buildMockNavigatorContextProvider()()
    );
    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ
    );
  });

  it('should accept an undefined SearchAction', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMockWithoutSearchAction as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(
      expectedStreamAnswerAPIParamWithoutSearchAction
    );
  });

  it('should include all analytics fields when usage is fetch', () => {
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMock as any,
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
    const queryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMock as any,
      buildMockNavigatorContextProvider()()
    );

    expect(queryParams).toEqual(expectedStreamAnswerAPIParam);

    const updatedQueryParams = constructAnswerQueryParams(
      streamAnswerAPIStateMock as any,
      buildMockNavigatorContextProvider()()
    );

    expect(updatedQueryParams).not.toEqual(
      expectedStreamAnswerAPIParamWithDifferentFacetTimes
    );
  });
});
