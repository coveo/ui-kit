import {
  paginationReducer,
  PaginationState,
  getPaginationInitialState,
} from './pagination-slice';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from './pagination-actions';

describe('pagination slice', () => {
  let state: PaginationState;

  beforeEach(() => {
    state = getPaginationInitialState();
  });

  it('initializes the number of results to 10', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({numberOfResults: 10});
  });

  it('#registerNumberOfResults sets the state #numberOfResults to the passed value', () => {
    const action = registerNumberOfResults(state.numberOfResults + 1);
    const finalState = paginationReducer(state, action);

    expect(finalState.numberOfResults).toBe(action.payload);
    expect(finalState.numberOfResults).not.toBe(state.numberOfResults);
  });

  it('#updateNumberOfResults sets the state #numberOfResults to the passed value', () => {
    const action = updateNumberOfResults(20);
    const finalState = paginationReducer(state, action);

    expect(finalState.numberOfResults).toBe(action.payload);
  });
});
