import {buildMockInsightState} from '../../../test/mock-insight-state';
import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../../test/mock-engine';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from './facet-set-insight-analytics-actions';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';

const mockLogBreadcrumbFacet = jest.fn();
const mockLogFacetSelect = jest.fn();
const mockLogFacetDeselect = jest.fn();
const mockLogFacetUpdateSort = jest.fn();
const mockLogFacetClearAll = jest.fn();
const mockLogFacetShowMore = jest.fn();
const mockLogFacetShowLess = jest.fn();

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

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleFacetId = 'exampleFacetId';
const exampleField = 'exampleField';
const exampleValue = 'exampleValue';
const exampleSortCriterion = 'score';

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(
      logFacetBreadcrumb({
        facetId: exampleFacetId,
        facetValue: exampleValue,
      })
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      facetId: exampleFacetId,
      facetField: exampleField,
      facetValue: exampleValue,
      facetTitle: `${exampleField}_${exampleFacetId}`,
    };

    expect(mockLogBreadcrumbFacet).toBeCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetSelect', () => {
  it('should log #logFacetSelect with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(
      logFacetSelect({
        facetId: exampleFacetId,
        facetValue: exampleValue,
      })
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      facetId: exampleFacetId,
      facetField: exampleField,
      facetValue: exampleValue,
      facetTitle: `${exampleField}_${exampleFacetId}`,
    };

    expect(mockLogFacetSelect).toBeCalledTimes(1);
    expect(mockLogFacetSelect.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logFacetDeselect', () => {
  it('should log #logFacetDeselect with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(
      logFacetDeselect({
        facetId: exampleFacetId,
        facetValue: exampleValue,
      })
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      facetId: exampleFacetId,
      facetField: exampleField,
      facetValue: exampleValue,
      facetTitle: `${exampleField}_${exampleFacetId}`,
    };

    expect(mockLogFacetDeselect).toBeCalledTimes(1);
    expect(mockLogFacetDeselect.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetUpdateSort', () => {
  it('should log #logFacetUpdateSort with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(
      logFacetUpdateSort({
        facetId: exampleFacetId,
        sortCriterion: exampleSortCriterion,
      })
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      facetId: exampleFacetId,
      facetField: exampleField,
      facetTitle: `${exampleField}_${exampleFacetId}`,
      criteria: exampleSortCriterion,
    };

    expect(mockLogFacetUpdateSort).toBeCalledTimes(1);
    expect(mockLogFacetUpdateSort.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetClearAll', () => {
  it('should log #logFacetClearAll with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(logFacetClearAll(exampleFacetId));

    const expectedPayload = {
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

    expect(mockLogFacetClearAll).toBeCalledTimes(1);
    expect(mockLogFacetClearAll.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetShowMore', () => {
  it('should log #logFacetShowMore with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(logFacetShowMore(exampleFacetId));

    const expectedPayload = {
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

    expect(mockLogFacetShowMore).toBeCalledTimes(1);
    expect(mockLogFacetShowMore.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFacetShowLess', () => {
  it('should log #logFacetShowLess with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        facetSet: {
          [exampleFacetId]: buildMockFacetRequest({
            facetId: exampleFacetId,
            field: exampleField,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(logFacetShowLess(exampleFacetId));

    const expectedPayload = {
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

    expect(mockLogFacetShowLess).toBeCalledTimes(1);
    expect(mockLogFacetShowLess.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
