import {nextPage, previousPage, selectPage} from './pagination-actions';
import {paginationReducer} from './pagination-slice';
import {PaginationState, getPaginationInitialState} from './pagination-state';

describe('pagination slice', () => {
  let state: PaginationState;

  beforeEach(() => {
    state = getPaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      page: 0,
      perPage: 0,
      totalCount: 0,
      totalPages: 0,
    });
  });

  it('#selectPage sets the current page', () => {
    const finalState = paginationReducer(state, selectPage(1));

    expect(finalState.page).toBe(1);
  });

  it('#nextPage increments the current page', () => {
    const finalState = paginationReducer(state, nextPage());

    expect(finalState.page).toBe(1);
  });

  it('#previousPage decrements the current page', () => {
    state.page = 1;
    const finalState = paginationReducer(state, previousPage());

    expect(finalState.page).toBe(0);
  });
});
