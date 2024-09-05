import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {logNotifyTrigger} from './insight-trigger-analytics-actions';
import {getTriggerInitialState} from './triggers-state';

const mockLogTriggerNotify = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logTriggerNotify: mockLogTriggerNotify,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});
const examplePermanentId = 'example permanent id';
const expectedNotifications = ['Hello'];

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  uniqueId: 'unique-id',
  excerpt: 'excerpt',
  firstSentences: 'first-sentences',
  flags: 'flags',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: examplePermanentId,
  }),
};
const exampleResult = buildMockResult(resultParams);

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

describe('the analytics related to the triggers feature in the insight use case', () => {
  let engine: MockedInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine(
      buildMockInsightState({
        configuration: {
          ...getConfigurationInitialState(),
          analytics: {
            ...getConfigurationInitialState().analytics,
            analyticsMode: 'legacy',
          },
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
        triggers: {
          ...getTriggerInitialState(),
          notifications: expectedNotifications,
        },
        search: buildMockSearchState({
          results: [exampleResult],
        }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log #logNotifyTrigger when there are notifications', async () => {
    await logNotifyTrigger()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogTriggerNotify;
    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse.mock.calls[0][0]).toStrictEqual({
      notifications: expectedNotifications,
    });
  });
});
