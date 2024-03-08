import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockPagination} from '../../test/mock-pagination';
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

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleFirstResultValue = 1;
const exampleNumberOfResults = 20;
const expectedPageNumber = 1;

const insightState = {
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
};

const expectedPayload = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
  pagerNumber: expectedPageNumber,
};

describe('logPagerNumber', () => {
  it('should log #logPagerNumber with the right payload', async () => {
    const engine = buildMockInsightEngine(buildMockInsightState(insightState));

    await logPageNumber()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerNumber).toBeCalledTimes(1);
    expect(mockLogPagerNumber.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logPagerNext', () => {
  it('should log #logPagerNext with the right payload', async () => {
    const engine = buildMockInsightEngine(buildMockInsightState(insightState));

    await logPageNext()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerNext).toBeCalledTimes(1);
    expect(mockLogPagerNext.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});

describe('logPagerPrevious', () => {
  it('should log #logPagerPrevious with the right payload', async () => {
    const engine = buildMockInsightEngine(buildMockInsightState(insightState));

    await logPagePrevious()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    expect(mockLogPagerPrevious).toBeCalledTimes(1);
    expect(mockLogPagerPrevious.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
