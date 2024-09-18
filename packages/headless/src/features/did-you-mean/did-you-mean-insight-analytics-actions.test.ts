import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logDidYouMeanAutomatic,
  logDidYouMeanClick,
} from './did-you-mean-insight-analytics-actions';

const mockLogDidYouMeanClick = jest.fn();
const mockLogDidYouMeanAutomatic = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logDidYouMeanClick: mockLogDidYouMeanClick,
    logDidYouMeanAutomatic: mockLogDidYouMeanAutomatic,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

describe('did you mean insight analytics actions', () => {
  let engine: InsightEngine;

  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';

  const expectedPayload = {
    caseContext: {
      Case_Subject: exampleSubject,
      Case_Description: exampleDescription,
    },
    caseId: exampleCaseId,
    caseNumber: exampleCaseNumber,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
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
        configuration,
      })
    );
  });

  it('should log #logDidYouMeanClick with the right payload', async () => {
    await logDidYouMeanClick()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogDidYouMeanClick).toHaveBeenCalledTimes(1);
    expect(mockLogDidYouMeanClick.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });

  it('should log #logDidYouMeanAutomatic with the right payload', async () => {
    await logDidYouMeanAutomatic()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogDidYouMeanAutomatic).toHaveBeenCalledTimes(1);
    expect(mockLogDidYouMeanAutomatic.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
