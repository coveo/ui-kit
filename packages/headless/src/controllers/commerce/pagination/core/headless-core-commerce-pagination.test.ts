import {
  selectPage,
  nextPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildCorePagination,
  Pagination,
} from './headless-core-commerce-pagination';

describe('core pagination', () => {
  let engine: MockCommerceEngine;
  let pagination: Pagination;
  const fetchResultsActionCreator = fetchProductListing;

  function initPagination() {
    engine = buildMockCommerceEngine();

    pagination = buildCorePagination(engine, {fetchResultsActionCreator});
  }

  beforeEach(() => {
    initPagination();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      commercePagination,
    });
  });

  it('exposes #subscribe method', () => {
    expect(pagination.subscribe).toBeTruthy();
  });

  it('#selectPage dispatches #selectPage & #fetchResultsActionCreator', () => {
    pagination.selectPage(0);
    expect(engine.actions.find((a) => a.type === selectPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #nextPage & #fetchResultsActionCreator', () => {
    pagination.nextPage();
    expect(engine.actions.find((a) => a.type === nextPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #previousPage & #fetchResultsActionCreator', () => {
    pagination.previousPage();
    expect(
      engine.actions.find((a) => a.type === previousPage.type)
    ).toBeTruthy();
    const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
    expect(action).toBeTruthy();
  });
});
