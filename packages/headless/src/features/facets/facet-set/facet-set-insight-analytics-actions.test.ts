import {ThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../../test/mock-engine-v2';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from './facet-set-insight-analytics-actions';

const mockLogBreadcrumbFacet = jest.fn();
const mockLogFacetSelect = jest.fn();
const mockLogFacetDeselect = jest.fn();
const mockLogFacetUpdateSort = jest.fn();
const mockLogFacetClearAll = jest.fn();
const mockLogFacetShowMore = jest.fn();
const mockLogFacetShowLess = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logBreadcrumbFacet: mockLogBreadcrumbFacet,
    logFacetSelect: mockLogFacetSelect,
    logFacetDeselect: mockLogFacetDeselect,
    logFacetUpdateSort: mockLogFacetUpdateSort,
    logFacetClearAll: mockLogFacetClearAll,
    logFacetShowMore: mockLogFacetShowMore,
    logFacetShowLess: mockLogFacetShowLess,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleFacetId = 'exampleFacetId';
const exampleField = 'exampleField';
const exampleValue = 'exampleValue';
const exampleSortCriterion = 'score';

const insightCaseContextState = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

const baseExpectedPayload = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
  facetId: exampleFacetId,
  facetField: exampleField,
  facetTitle: `${exampleField}_${exampleFacetId}`,
};

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );
    await logFacetBreadcrumb({
      facetId: exampleFacetId,
      facetValue: exampleValue,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      ...baseExpectedPayload,
      facetValue: exampleValue,
    };

    expect(mockLogBreadcrumbFacet).toHaveBeenCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetSelect', () => {
  it('should log #logFacetSelect with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetSelect({facetId: exampleFacetId, facetValue: exampleValue})()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const expectedPayload = {
      ...baseExpectedPayload,
      facetValue: exampleValue,
    };

    expect(mockLogFacetSelect).toHaveBeenCalledTimes(1);
    expect(mockLogFacetSelect.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logFacetDeselect', () => {
  it('should log #logFacetDeselect with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetDeselect({
      facetId: exampleFacetId,
      facetValue: exampleValue,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      ...baseExpectedPayload,
      facetValue: exampleValue,
    };

    expect(mockLogFacetDeselect).toHaveBeenCalledTimes(1);
    expect(mockLogFacetDeselect.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetUpdateSort', () => {
  it('should log #logFacetUpdateSort with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetUpdateSort({
      facetId: exampleFacetId,
      sortCriterion: exampleSortCriterion,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      ...baseExpectedPayload,
      criteria: exampleSortCriterion,
    };

    expect(mockLogFacetUpdateSort).toHaveBeenCalledTimes(1);
    expect(mockLogFacetUpdateSort.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetClearAll', () => {
  it('should log #logFacetClearAll with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetClearAll(exampleFacetId)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const expectedPayload = baseExpectedPayload;

    expect(mockLogFacetClearAll).toHaveBeenCalledTimes(1);
    expect(mockLogFacetClearAll.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetShowMore', () => {
  it('should log #logFacetShowMore with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetShowMore(exampleFacetId)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const expectedPayload = baseExpectedPayload;

    expect(mockLogFacetShowMore).toHaveBeenCalledTimes(1);
    expect(mockLogFacetShowMore.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetShowLess', () => {
  it('should log #logFacetShowLess with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetSlice({
            request: buildMockFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
        insightCaseContext: insightCaseContextState,
      })
    );

    await logFacetShowLess(exampleFacetId)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const expectedPayload = baseExpectedPayload;

    expect(mockLogFacetShowLess).toHaveBeenCalledTimes(1);
    expect(mockLogFacetShowLess.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
