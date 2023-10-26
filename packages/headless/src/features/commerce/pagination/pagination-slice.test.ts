import {nextPage, previousPage, selectPage} from './pagination-actions';
import {paginationReducer} from './pagination-slice';
import {
  CommercePaginationState,
  getCommercePaginationInitialState,
} from './pagination-state';

describe('pagination slice', () => {
  let state: CommercePaginationState;

  beforeEach(() => {
    state = getCommercePaginationInitialState();
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

  it('#selectPage does not update the current page if specified page is invalid', () => {
    state.totalPages = 1;

    let finalState = paginationReducer(state, selectPage(1));

    expect(finalState.page).toBe(0);

    finalState = paginationReducer(state, selectPage(-1));

    expect(finalState.page).toBe(0);
  });

  it('#selectPage updates the current page if valid', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, selectPage(1));

    expect(finalState.page).toBe(1);
  });

  it('#nextPage does not update the current page if already on the last page', () => {
    state.totalPages = 2;
    state.page = 1;
    const finalState = paginationReducer(state, nextPage());

    expect(finalState.page).toBe(1);
  });

  it('#nextPage increments the current page if not already on last page', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, nextPage());

    expect(finalState.page).toBe(1);
  });

  it('#previousPage does not update the current page if already on the first page', () => {
    state.totalPages = 2;
    const finalState = paginationReducer(state, previousPage());

    expect(finalState.page).toBe(0);
  });

  it('#previousPage decrements the current page if not already on first page', () => {
    state.totalPages = 2;
    state.page = 1;
    const finalState = paginationReducer(state, previousPage());

    expect(finalState.page).toBe(0);
  });
});
