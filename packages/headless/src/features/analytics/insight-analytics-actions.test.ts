import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logInsightCreateArticle,
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from './insight-analytics-actions';

const mockLogInterfaceLoad = jest.fn();
const mockLogInterfaceChange = jest.fn();
const mockLogCreateArticle = jest.fn();

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleOriginLevel2 = 'exampleOriginLevel2';
const exampleCreateArticleMetadata = {
  articleType: 'Knowledge__kav',
  triggeredBy: 'CreateArticleButton',
};

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logInterfaceLoad: mockLogInterfaceLoad,
    logInterfaceChange: mockLogInterfaceChange,
    logCreateArticle: mockLogCreateArticle,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

describe('insight analytics actions', () => {
  let engine: MockInsightEngine;
  beforeEach(() => {
    engine = buildMockInsightEngine({
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
  });

  it('should log #logInterfaceLoad with the right payload', async () => {
    await engine.dispatch(logInsightInterfaceLoad());

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

  it('should log #logInterfaceChange with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
      }),
    });

    await engine.dispatch(logInsightInterfaceChange());

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

  it('should log #logCreateArticle with the right payload', async () => {
    await engine.dispatch(
      logInsightCreateArticle(exampleCreateArticleMetadata)
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogCreateArticle).toHaveBeenCalledTimes(1);
    expect(mockLogCreateArticle.mock.calls[0][0]).toStrictEqual(
      exampleCreateArticleMetadata
    );
    expect(mockLogCreateArticle.mock.calls[0][1]).toStrictEqual(
      expectedPayload
    );
  });
});
