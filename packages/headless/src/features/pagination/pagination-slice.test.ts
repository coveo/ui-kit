import {
  paginationReducer,
  PaginationState,
  getPaginationInitialState,
  calculatePage,
} from './pagination-slice';
import {
  registerNumberOfResults,
  updateNumberOfResults,
  updatePage,
  registerPage,
  previousPage,
  nextPage,
} from './pagination-actions';
import {buildMockSearch} from '../../test/mock-search';
import {getHistoryInitialState} from '../history/history-slice';
import {change} from '../history/history-actions';
import {executeSearch} from '../search/search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';

describe('pagination slice', () => {
  let state: PaginationState;

  function determinePage(state: PaginationState) {
    const {firstResult, numberOfResults} = state;
    return calculatePage(firstResult, numberOfResults);
  }

  beforeEach(() => {
    state = getPaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      numberOfResults: 10,
      firstResult: 0,
      totalCountFiltered: 0,
    });
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

  it('when on page 2, #previousPage sets the page to 1', () => {
    state.firstResult = 10;
    state.numberOfResults = 10;
    expect(determinePage(state)).toBe(2);

    const finalState = paginationReducer(state, previousPage());
    expect(determinePage(finalState)).toBe(1);
  });

  it('when on page 1, #previousPage does nothing', () => {
    expect(determinePage(state)).toBe(1);

    const finalState = paginationReducer(state, previousPage());
    expect(determinePage(finalState)).toBe(1);
  });

  it('when on page 1, #nextPage sets the page to 2', () => {
    state.totalCountFiltered = 20;
    expect(determinePage(state)).toBe(1);

    const finalState = paginationReducer(state, nextPage());
    expect(determinePage(finalState)).toBe(2);
  });

  it('when on page 1 and the maximum page is 1, #nextPage does nothing', () => {
    state.totalCountFiltered = 10;
    expect(determinePage(state)).toBe(1);

    const finalState = paginationReducer(state, nextPage());
    expect(determinePage(finalState)).toBe(1);
  });

  it('executeSearch.fulfilled updates totalCountFiltered to the response value', () => {
    const search = buildMockSearch();
    search.response.totalCountFiltered = 100;
    const action = executeSearch.fulfilled(search, '', logSearchboxSubmit());

    const finalState = paginationReducer(state, action);
    expect(finalState.totalCountFiltered).toBe(
      search.response.totalCountFiltered
    );
  });

  it('allows to restore pagination state on history change', () => {
    const state = getPaginationInitialState();
    const expectedPagination = {
      firstResult: 123,
      numberOfResults: 456,
      totalCountFiltered: 123,
    };
    const historyChange = {
      ...getHistoryInitialState(),
      pagination: expectedPagination,
    };

    const nextState = paginationReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState.firstResult).toEqual(123);
    expect(nextState.numberOfResults).toEqual(456);
  });
});
