import type {Action} from '@reduxjs/toolkit';
import {buildMockSearch} from '../../test/mock-search.js';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions.js';
import {toggleSelectAutomaticFacetValue} from '../facets/automatic-facet-set/automatic-facet-set-actions.js';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
} from '../facets/category-facet-set/category-facet-set-actions.js';
import {selectCategoryFacetSearchResult} from '../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './../facets/facet-set/facet-set-actions.js';
import {
  deselectAllDateFacetValues,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from '../facets/range-facets/date-facet-set/date-facet-actions.js';
import {
  deselectAllNumericFacetValues,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetValues,
} from '../facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {logSearchboxSubmit} from '../query/query-analytics-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {
  nextPage,
  previousPage,
  registerNumberOfResults,
  registerPage,
  updateNumberOfResults,
  updatePage,
} from './pagination-actions.js';
import {calculatePage, paginationReducer} from './pagination-slice.js';
import {
  getPaginationInitialState,
  type PaginationState,
} from './pagination-state.js';

describe('pagination slice', () => {
  let state: PaginationState;

  function determinePage(state: PaginationState) {
    const {firstResult, numberOfResults} = state;
    return calculatePage(firstResult, numberOfResults);
  }

  function testResetPagination(action: Action) {
    state.firstResult = 10;
    state.numberOfResults = 10;
    const nextState = paginationReducer(state, action);

    expect(nextState.firstResult).toEqual(
      getPaginationInitialState().firstResult
    );
  }

  beforeEach(() => {
    state = getPaginationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = paginationReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      defaultNumberOfResults: 10,
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

  it('#updateActiveTab should return to the first page by setting the #firstResult to 0', () => {
    const action = updateActiveTab('page');
    const finalState = paginationReducer(state, action);

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

  it('does not return fraction of pages', () => {
    state.numberOfResults = 3;

    state.firstResult = 2;
    expect(determinePage(state)).toBe(2);

    state.firstResult = 4;
    expect(determinePage(state)).toBe(2);
  });

  it('executeSearch.fulfilled updates totalCountFiltered to the response value', () => {
    const search = buildMockSearch();
    search.response.totalCountFiltered = 100;
    const action = executeSearch.fulfilled(search, '', {
      legacy: logSearchboxSubmit(),
    });

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
      defaultNumberOfResults: 0xabc,
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

  describe('#restoreSearchParameters', () => {
    it('when the object contains a #firstResult key, it sets the value in state', () => {
      state.firstResult = 1;
      const finalState = paginationReducer(
        state,
        restoreSearchParameters({firstResult: 0})
      );
      expect(finalState.firstResult).toEqual(0);
    });

    it('when the object does not contain a #firstResult key, it does not update the property in state', () => {
      state.firstResult = 1;
      const finalState = paginationReducer(state, restoreSearchParameters({}));
      expect(finalState.firstResult).toEqual(state.firstResult);
    });

    it('when the object contains a #numberOfResults key, it sets the value in state', () => {
      state.numberOfResults = 1;
      const finalState = paginationReducer(
        state,
        restoreSearchParameters({numberOfResults: 0})
      );
      expect(finalState.numberOfResults).toEqual(0);
    });

    it('when the object does not contain a #numberOfResults key, it restores the #defaultNumberOfResults', () => {
      state.numberOfResults = 1;
      state.defaultNumberOfResults = 15;
      const finalState = paginationReducer(state, restoreSearchParameters({}));
      expect(finalState.numberOfResults).toEqual(state.defaultNumberOfResults);
    });
  });

  describe('restore pagination on  facet toggle actions', () => {
    it('when a facet is toggled, #firstResult is set to 0', () => {
      testResetPagination(toggleSelectFacetValue);
    });

    it('when a date facet is toggled, #firstResult is set to 0', () => {
      testResetPagination(toggleSelectDateFacetValue);
    });

    it('when a category facet is toggled, #firstResult is set to 0', () => {
      testResetPagination(toggleSelectCategoryFacetValue);
    });

    it('when a numeric facet is toggled, #firstResult is set to 0', () => {
      testResetPagination(toggleSelectNumericFacetValue);
    });

    it('when a facet search result is selected, #firstResult is set to 0', () => {
      testResetPagination(selectFacetSearchResult);
    });

    it('when a facet excluded search result is deselected, #firstResult is set to 0', () => {
      testResetPagination(excludeFacetSearchResult);
    });

    it('when a category facet search result is selected, #firstResult is set to 0', () => {
      testResetPagination(selectCategoryFacetSearchResult);
    });

    it('when all facet values are deselected, #firstResult is set to 0', () => {
      testResetPagination(deselectAllFacetValues);
    });

    it('when all date facet excluded values are deselected, #firstResult is set to 0', () => {
      testResetPagination(toggleExcludeDateFacetValue);
    });

    it('when all numeric facet excluded values are deselected, #firstResult is set to 0', () => {
      testResetPagination(toggleExcludeNumericFacetValue);
    });

    it('when all facet excluded values are deselected, #firstResult is set to 0', () => {
      testResetPagination(toggleExcludeFacetValue);
    });

    it('when all category facet values are deselected, #firstResult is set to 0', () => {
      testResetPagination(deselectAllCategoryFacetValues);
    });

    it('when all date facet values are deselected, #firstResult is set to 0', () => {
      testResetPagination(deselectAllDateFacetValues);
    });

    it('when all numeric facet values are deselected, #firstResult is set to 0', () => {
      testResetPagination(deselectAllNumericFacetValues);
    });

    it('when all breadcrumbs are deselected, #firstResult is set to 0', () => {
      testResetPagination(deselectAllBreadcrumbs);
    });

    it('when numeric facet values are updated, #firstResult is set to 0', () => {
      testResetPagination(updateDateFacetValues);
    });

    it('when date facet values are updated, #firstResult is set to 0', () => {
      testResetPagination(updateNumericFacetValues);
    });

    it('when automatic facet values are updated, #firstResult is set to 0', () => {
      testResetPagination(toggleSelectAutomaticFacetValue);
    });
  });
});
