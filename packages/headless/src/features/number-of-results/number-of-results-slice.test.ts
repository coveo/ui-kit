import {
  numberOfResultsReducer,
  NumberOfResultsState,
  getNumberOfResultsInitialState,
} from './number-of-results-slice';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from './number-of-results-actions';

describe('numberOfResults slice', () => {
  let state: NumberOfResultsState;

  beforeEach(() => {
    state = getNumberOfResultsInitialState();
  });

  it('initializes the number of results to 10', () => {
    const finalState = numberOfResultsReducer(undefined, {type: ''});
    expect(finalState).toBe(10);
  });

  it('#registerNumberOfResults sets the state to the passed value', () => {
    const action = registerNumberOfResults(state + 1);
    const finalState = numberOfResultsReducer(state, action);

    expect(finalState).toBe(action.payload);
    expect(finalState).not.toBe(state);
  });

  it('#updateNumberOfResults sets the state to the passed value', () => {
    const action = updateNumberOfResults(20);
    const finalState = numberOfResultsReducer(state, action);

    expect(finalState).toBe(action.payload);
  });
});
