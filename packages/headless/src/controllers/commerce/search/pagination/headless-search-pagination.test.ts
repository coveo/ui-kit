import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {Pagination} from '../../core/pagination/headless-core-commerce-pagination';
import {buildSearchPagination} from './headless-search-pagination';

jest.mock('../../../../features/commerce/search/search-actions');

describe('search pagination', () => {
  let engine: MockedCommerceEngine;
  let searchPagination: Pagination;

  function initSearchPagination() {
    engine = buildMockCommerceEngine(buildMockCommerceState());
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
    expect(executeSearch).toHaveBeenCalled();
  });

  it('#nextPage dispatches #executeSearch', () => {
    searchPagination.nextPage();
    expect(executeSearch).toHaveBeenCalled();
  });

  it('#previousPage dispatches #executeSearch', () => {
    searchPagination.previousPage();
    expect(executeSearch).toHaveBeenCalled();
  });
});
