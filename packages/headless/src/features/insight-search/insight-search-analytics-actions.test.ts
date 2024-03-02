import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {getCaseContextInitialState} from '../case-context/case-context-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getQueryInitialState} from '../query/query-state';
import {
  logContextChanged,
  logFetchMoreResults,
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
  logQueryError,
} from './insight-search-analytics-actions';

const mockLogContextChanged = jest.fn();
const mockLogFetchMoreResults = jest.fn();
const mockLogQueryError = jest.fn();
const mockLogInterfaceLoad = jest.fn();
const mockLogInterfaceChange = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logContextChanged: mockLogContextChanged,
    logFetchMoreResults: mockLogFetchMoreResults,
    logQueryError: mockLogQueryError,
    logInterfaceLoad: mockLogInterfaceLoad,
    logInterfaceChange: mockLogInterfaceChange,
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
const exampleOriginLevel2 = 'exampleOriginLevel2';
const exampleErrorType = 'example error type';
const exampleErrorMessage = 'example error message';
const exampleQuery = 'test query';

describe('insight search analytics events', () => {
  let engine: InsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          ...getCaseContextInitialState(),
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      })
    );
  });

  describe('logContextChanged', () => {
    it('should log #logContextChanged with the right payload', async () => {
      await logContextChanged(exampleCaseId, exampleCaseNumber)()(
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

      expect(mockLogContextChanged).toHaveBeenCalledTimes(1);
      expect(mockLogContextChanged.mock.calls[0][0]).toStrictEqual(
        expectedPayload
      );
    });
  });

  describe('logFetchMoreResults', () => {
    it('should log #logFetchMoreResults with the right payload', async () => {
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

      expect(mockLogFetchMoreResults).toHaveBeenCalledTimes(1);
      expect(mockLogFetchMoreResults.mock.calls[0][0]).toStrictEqual(
        expectedPayload
      );
    });
  });

  describe('logQueryError', () => {
    it('should log #logQueryError with the right payload', async () => {
      engine = buildMockInsightEngine(
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

      expect(mockLogQueryError).toHaveBeenCalledTimes(1);
      expect(mockLogQueryError.mock.calls[0][0]).toStrictEqual(expectedPayload);
    });
  });

  describe('logInterfaceLoad', () => {
    it('should log #logInterfaceLoad with the right payload', async () => {
      await logInsightInterfaceLoad()()(
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

      expect(mockLogInterfaceLoad).toHaveBeenCalledTimes(1);
      expect(mockLogInterfaceLoad.mock.calls[0][0]).toStrictEqual(
        expectedPayload
      );
    });
  });

  describe('logInterfaceChange', () => {
    it('should log #logInterfaceChange with the right payload', async () => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({
              originLevel2: exampleOriginLevel2,
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
        })
      );

      await logInsightInterfaceChange()()(
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
        interfaceChangeTo: exampleOriginLevel2,
      };

      expect(mockLogInterfaceChange).toHaveBeenCalledTimes(1);
      expect(mockLogInterfaceChange.mock.calls[0][0]).toStrictEqual(
        expectedPayload
      );
    });
  });
});
