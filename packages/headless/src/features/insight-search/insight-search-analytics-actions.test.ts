import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {
  logContextChanged,
  logExpandToFullUI,
  logFetchMoreResults,
  logQueryError,
} from './insight-search-analytics-actions';
import * as CoveoAnalytics from 'coveo.analytics';
import {getCaseContextInitialState} from '../case-context/case-context-state';
import {getQueryInitialState} from '../query/query-state';

const mockLogContextChanged = jest.fn();
const mockLogExpandtoFullUI = jest.fn();
const mockLogFetchMoreResults = jest.fn();
const mockLogQueryError = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logContextChanged: mockLogContextChanged,
  logExpandToFullUI: mockLogExpandtoFullUI,
  logFetchMoreResults: mockLogFetchMoreResults,
  logQueryError: mockLogQueryError,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

describe('logContextChanged', () => {
  it('should log #logContextChanged with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        insightCaseContext: {
          ...getCaseContextInitialState(),
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
        },
      }),
    });
    await engine.dispatch(logContextChanged('1234', '5678'));

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: '1234',
      caseNumber: '5678',
    };

    expect(mockLogContextChanged).toBeCalledTimes(1);
    expect(mockLogContextChanged.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logExpandToFullUI', () => {
  it('should log #logExpandToFullUI with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        insightCaseContext: {
          ...getCaseContextInitialState(),
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
        },
      }),
    });
    await engine.dispatch(
      logExpandToFullUI('1234', '5678', 'c__FullSearch', 'openFullSearchButton')
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: '1234',
      caseNumber: '5678',
      fullSearchComponentName: 'c__FullSearch',
      triggeredBy: 'openFullSearchButton',
    };

    expect(mockLogExpandtoFullUI).toBeCalledTimes(1);
    expect(mockLogExpandtoFullUI.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logFetchMoreResults', () => {
  it('should log #logFetchMoreResults with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
    await engine.dispatch(logFetchMoreResults());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogFetchMoreResults).toBeCalledTimes(1);
    expect(mockLogFetchMoreResults.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logQueryError', () => {
  it('should log #llogQueryError with the right payload', async () => {
    const exampleErrorType = 'example error type';
    const exampleErrorMessage = 'example error message';
    const exampleQuery = 'test query';

    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
        query: {
          ...getQueryInitialState(),
          q: exampleQuery,
        },
      }),
    });

    const exampleError = {
      type: exampleErrorType,
      message: exampleErrorMessage,
      statusCode: 400,
    };
    await engine.dispatch(logQueryError(exampleError));

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      query: exampleQuery,
      aq: '',
      cq: '',
      dq: '',
      errorType: exampleErrorType,
      errorMessage: exampleErrorMessage,
    };

    expect(mockLogQueryError).toBeCalledTimes(1);
    expect(mockLogQueryError.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});
