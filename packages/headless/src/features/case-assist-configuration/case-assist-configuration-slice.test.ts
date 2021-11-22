import {setCaseAssistConfiguration} from './case-assist-configuration-actions';
import {caseAssistConfigurationReducer} from './case-assist-configuration-slice';
import {
  getCaseAssistConfigurationInitialState,
  CaseAssistConfigurationState,
} from './case-assist-configuration-state';

describe('case assist slice', () => {
  let state: CaseAssistConfigurationState;

  beforeEach(() => {
    state = getCaseAssistConfigurationInitialState();
  });

  it('should have an initial state', () => {
    expect(caseAssistConfigurationReducer(undefined, {type: 'foo'})).toEqual(
      getCaseAssistConfigurationInitialState()
    );
  });

  it('should allow to set the case assist configuration', () => {
    const testId = 'foo';
    const testLocale = 'bar';
    const modifiedState = caseAssistConfigurationReducer(
      state,
      setCaseAssistConfiguration({caseAssistId: testId, locale: testLocale})
    );
    expect(modifiedState.caseAssistId).toEqual(testId);
    expect(modifiedState.locale).toEqual(testLocale);
  });
});
