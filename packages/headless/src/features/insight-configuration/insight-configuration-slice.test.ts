import {setInsightConfiguration} from './insight-configuration-actions';
import {insightConfigurationReducer} from './insight-configuration-slice';
import {
  getInsightConfigurationInitialState,
  InsightConfigurationState,
} from './insight-configuration-state';

describe('insight configuration slice', () => {
  let state: InsightConfigurationState;

  beforeEach(() => {
    state = getInsightConfigurationInitialState();
  });

  it('should have an initial state', () => {
    expect(insightConfigurationReducer(undefined, {type: 'foo'})).toEqual(
      getInsightConfigurationInitialState()
    );
  });

  it('should allow to set the insight configuration', () => {
    const testId = 'foo';
    const modifiedState = insightConfigurationReducer(
      state,
      setInsightConfiguration({insightId: testId})
    );

    expect(modifiedState.insightId).toEqual(testId);
  });
});
