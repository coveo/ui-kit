import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {Pagination} from '../../pagination/core/headless-core-commerce-pagination';
import {buildSearchPagination} from './headless-search-pagination';

describe('search pagination', () => {
  let engine: MockCommerceEngine;
  let searchPagination: Pagination;

  function initSearchPagination() {
    engine = buildMockCommerceEngine();

    searchPagination = buildSearchPagination(engine);
  }

  beforeEach(() => {
    initSearchPagination();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      commerceSearch,
    });
  });

  it('exposes #subscribe method', () => {
    expect(searchPagination.subscribe).toBeTruthy();
  });

  it('#selectPage dispatches #executeSearch', () => {
    searchPagination.selectPage(0);
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #executeSearch', () => {
    searchPagination.nextPage();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #executeSearch', () => {
    searchPagination.previousPage();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });
});
