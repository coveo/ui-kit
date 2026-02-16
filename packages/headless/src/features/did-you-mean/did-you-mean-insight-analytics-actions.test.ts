import {CoveoInsightClient} from 'coveo.analytics';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  logDidYouMeanAutomatic,
  logDidYouMeanClick,
} from './did-you-mean-insight-analytics-actions.js';

const mockLogDidYouMeanClick = vi.fn();
const mockLogDidYouMeanAutomatic = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logDidYouMeanClick = mockLogDidYouMeanClick;
  this.logDidYouMeanAutomatic = mockLogDidYouMeanAutomatic;
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
    vi.clearAllMocks();
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
