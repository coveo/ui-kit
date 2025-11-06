import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {logNotifyTrigger} from './insight-trigger-analytics-actions.js';
import {getTriggerInitialState} from './triggers-state.js';

const mockLogTriggerNotify = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logTriggerNotify = mockLogTriggerNotify;
});

const expectedNotifications = ['Hello'];

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
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
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
