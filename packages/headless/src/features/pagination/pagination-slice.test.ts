import {
  paginationReducer,
  PaginationState,
  getPaginationInitialState,
} from './pagination-slice';
import {
  registerNumberOfResults,
  updateNumberOfResults,
  updatePage,
  registerPage,
} from './pagination-actions';

describe('pagination slice', () => {
  let state: PaginationState;

  beforeEach(() => {
    state = getPaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({numberOfResults: 10, firstResult: 0});
  });

  it('#registerNumberOfResults sets the state #numberOfResults to the passed value', () => {
    const action = registerNumberOfResults(state.numberOfResults + 1);
    const finalState = paginationReducer(state, action);

    expect(finalState.numberOfResults).toBe(action.payload);
    expect(finalState.numberOfResults).not.toBe(state.numberOfResults);
  });

  it(`when a page is not 1 (i.e. #firstResult is not 0),
  #registerNumberOfResults updates the firstResult to preserve the page`, () => {
    state = paginationReducer(state, registerPage(2));
    const finalState = paginationReducer(state, registerNumberOfResults(25));
    expect(finalState.firstResult).toBe(25);
  });

  it('#updateNumberOfResults sets the state #numberOfResults to the passed value', () => {
    const action = updateNumberOfResults(20);
    const finalState = paginationReducer(state, action);

    expect(finalState.numberOfResults).toBe(action.payload);
  });

  it('#updateNumberOfResults sets the #firstResult to 0', () => {
    state.firstResult = 1;
    const finalState = paginationReducer(state, updateNumberOfResults(20));

    expect(finalState.firstResult).toBe(0);
  });

  it('#registerPage sets #firstResult correctly', () => {
    state.numberOfResults = 20;
    const finalState = paginationReducer(state, registerPage(2));
    expect(finalState.firstResult).toBe(20);
  });

  it('#updatePage with page 1 sets the #firstResult to 0', () => {
    state.firstResult = 1;
    const finalState = paginationReducer(state, updatePage(1));
    expect(finalState.firstResult).toBe(0);
  });

  it('with #numberOfResults set to 10, #updatePage with page 2 sets the #firstResult to 10', () => {
    state.numberOfResults = 10;
    const finalState = paginationReducer(state, updatePage(2));
    expect(finalState.firstResult).toBe(10);
  });
});
