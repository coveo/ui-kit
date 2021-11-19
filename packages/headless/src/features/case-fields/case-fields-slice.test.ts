import {setCaseAssistId} from './case-assist-actions';
import {caseAssistReducer} from './case-assist-slice';
import {getCaseAssistInitialState, CaseAssistState} from './case-assist-state';

describe('case assist slice', () => {
  let state: CaseAssistState;
  beforeEach(() => {
    state = getCaseAssistInitialState();
  });
  it('should have an initial state', () => {
    expect(caseAssistReducer(undefined, {type: 'foo'})).toEqual(
      getCaseAssistInitialState()
    );
  });

  it('should have a default case assist ID', () => {
    expect(caseAssistReducer(undefined, {type: 'foo'}).caseAssistId).toEqual(
      'CaseAssist'
    );
  });

  it('should allow to set the case assist ID', () => {
    expect(
      caseAssistReducer(state, setCaseAssistId({id: 'foo'})).caseAssistId
    ).toEqual('foo');
  });
});
