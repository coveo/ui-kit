import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine-v2';
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
  let engine: MockedInsightEngine;
  beforeEach(() => {
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
      })
    );
  });

  it('should log #logInterfaceLoad with the right payload', async () => {
    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    await logInsightInterfaceLoad()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogInterfaceLoad).toHaveBeenCalledTimes(1);
    expect(mockLogInterfaceLoad.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });

  it('should log #logInterfaceChange with the right payload', async () => {
    const engine = buildMockInsightEngine(
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

  it('should log #logCreateArticle with the right payload', async () => {
    await logInsightCreateArticle(exampleCreateArticleMetadata)()(
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

    expect(mockLogCreateArticle).toHaveBeenCalledTimes(1);
    expect(mockLogCreateArticle.mock.calls[0][0]).toStrictEqual(
      exampleCreateArticleMetadata
    );
    expect(mockLogCreateArticle.mock.calls[0][1]).toStrictEqual(
      expectedPayload
    );
  });
});
