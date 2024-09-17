import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {InsightAppState} from '../../state/insight-app-state';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockPagination} from '../../test/mock-pagination';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
} from './pagination-insight-analytics-actions';

const mockLogPagerNumber = jest.fn();
const mockLogPagerNext = jest.fn();
const mockLogPagerPrevious = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logPagerNumber: mockLogPagerNumber,
    logPagerNext: mockLogPagerNext,
    logPagerPrevious: mockLogPagerPrevious,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

describe('pagination insight analytics actions', () => {
  let engine: InsightEngine;

  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';

  const configurationInitialState = getConfigurationInitialState();
  const insightState: Partial<InsightAppState> = {
    pagination: buildMockPagination({
      firstResult: 1,
      numberOfResults: 20,
    }),
    insightCaseContext: {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    },
    configuration: {
      ...configurationInitialState,
      analytics: {
        ...configurationInitialState.analytics,
        analyticsMode: 'legacy',
      },
    },
  };

  const expectedPayload = {
    caseContext: {
      Case_Subject: exampleSubject,
      Case_Description: exampleDescription,
    },
    caseId: exampleCaseId,
    caseNumber: exampleCaseNumber,
    pagerNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    engine = buildMockInsightEngine(buildMockInsightState(insightState));
  });

  it('should log #logPagerNumber with the right payload', async () => {
    await logPageNumber()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerNumber).toHaveBeenCalledTimes(1);
    expect(mockLogPagerNumber.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });

  it('should log #logPagerNext with the right payload', async () => {
    await logPageNext()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerNext).toHaveBeenCalledTimes(1);
    expect(mockLogPagerNext.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });

  it('should log #logPagerPrevious with the right payload', async () => {
    await logPagePrevious()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerPrevious).toHaveBeenCalledTimes(1);
    expect(mockLogPagerPrevious.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
