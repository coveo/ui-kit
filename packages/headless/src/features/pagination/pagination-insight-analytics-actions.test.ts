import {buildMockInsightState} from '../../test/mock-insight-state';
import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
} from './pagination-insight-analytics-actions';
import {buildMockPagination} from '../../test/mock-pagination';

const mockLogPagerNumber = jest.fn();
const mockLogPagerNext = jest.fn();
const mockLogPagerPrevious = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logPagerNumber: mockLogPagerNumber,
  logPagerNext: mockLogPagerNext,
  logPagerPrevious: mockLogPagerPrevious,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleFirstResultValue = 1;
const exampleNumberOfResults = 20;
const expectedPAgeNumber = 1;

describe('logPagerNumber', () => {
  it('should log #logPagerNumber with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        pagination: buildMockPagination({
          firstResult: exampleFirstResultValue,
          numberOfResults: exampleNumberOfResults,
        }),
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

    await engine.dispatch(logPageNumber());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      pagerNumber: expectedPAgeNumber,
    };

    expect(mockLogPagerNumber).toBeCalledTimes(1);
    expect(mockLogPagerNumber.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logPagerNext', () => {
  it('should log #logPagerNext with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        pagination: buildMockPagination({
          firstResult: exampleFirstResultValue,
          numberOfResults: exampleNumberOfResults,
        }),
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

    await engine.dispatch(logPageNext());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      pagerNumber: expectedPAgeNumber,
    };

    expect(mockLogPagerNext).toBeCalledTimes(1);
    expect(mockLogPagerNext.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logPagerPrevious', () => {
  it('should log #logPagerPrevious with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        pagination: buildMockPagination({
          firstResult: exampleFirstResultValue,
          numberOfResults: exampleNumberOfResults,
        }),
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

    await engine.dispatch(logPagePrevious());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      pagerNumber: expectedPAgeNumber,
    };

    expect(mockLogPagerPrevious).toBeCalledTimes(1);
    expect(mockLogPagerPrevious.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
