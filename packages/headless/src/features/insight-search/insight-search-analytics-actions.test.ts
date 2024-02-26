import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {getCaseContextInitialState} from '../case-context/case-context-state';
import {getQueryInitialState} from '../query/query-state';
import {
  logContextChanged,
  logExpandToFullUI,
  logFetchMoreResults,
  logQueryError,
} from './insight-search-analytics-actions';

const mockLogContextChanged = jest.fn();
const mockLogExpandtoFullUI = jest.fn();
const mockLogFetchMoreResults = jest.fn();
const mockLogQueryError = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logContextChanged: mockLogContextChanged,
    logExpandToFullUI: mockLogExpandtoFullUI,
    logFetchMoreResults: mockLogFetchMoreResults,
    logQueryError: mockLogQueryError,
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

describe('logContextChanged', () => {
  it('should log #logContextChanged with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          ...getCaseContextInitialState(),
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
        },
      })
    );
    await logContextChanged('1234', '5678')()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

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
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          ...getCaseContextInitialState(),
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
        },
      })
    );
    await logExpandToFullUI(
      '1234',
      '5678',
      'c__FullSearch',
      'openFullSearchButton'
    )()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

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
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      })
    );
    await logFetchMoreResults()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

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
  it('should log #logQueryError with the right payload', async () => {
    const exampleErrorType = 'example error type';
    const exampleErrorMessage = 'example error message';
    const exampleQuery = 'test query';

    const engine = buildMockInsightEngine(
      buildMockInsightState({
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
      })
    );

    const exampleError = {
      type: exampleErrorType,
      message: exampleErrorMessage,
      statusCode: 400,
    };
    await logQueryError(exampleError)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

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
