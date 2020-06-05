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

  it('initializes the number of results to -1', () => {
    const finalState = numberOfResultsReducer(undefined, {type: ''});
    expect(finalState).toBe(-1);
  });

  it('when the state is not initialized, #registerNumberOfResults sets the state to the passed value', () => {
    const action = registerNumberOfResults(state + 1);
    const finalState = numberOfResultsReducer(state, action);

    expect(finalState).toBe(action.payload);
    expect(finalState).not.toBe(state);
  });

  it('when the state is initialized, #registerNumberOfResults does not change the state', () => {
    state = 20;
    const action = registerNumberOfResults(state + 1);
    const finalState = numberOfResultsReducer(state, action);

    expect(finalState).toBe(state);
    expect(finalState).not.toBe(action.payload);
  });

  it('#updateNumberOfResults sets the state to the passed value', () => {
    const action = updateNumberOfResults(20);
    const finalState = numberOfResultsReducer(state, action);

    expect(finalState).toBe(action.payload);
  });
});
