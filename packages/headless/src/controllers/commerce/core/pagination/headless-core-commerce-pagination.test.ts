import {
  selectPage,
  nextPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {MockCommerceEngine} from '../../../../test/mock-engine';
import {buildMockCommerceEngine} from '../../../../test/mock-engine';
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

  describe('#selectPage', () => {
    beforeEach(() => {
      pagination.selectPage(0);
    });

    it('dispatches #selectPage', () => {
      expect(engine.actions).toContainEqual(selectPage(0));
    });

    it('dispatches #fetchResultsActionCreator', () => {
      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#nextPage', () => {
    beforeEach(() => {
      pagination.nextPage();
    });

    it('dispatches #nextPage', () => {
      expect(engine.actions).toContainEqual(nextPage());
    });

    it('dispatches #fetchResultsActionCreator', () => {
      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#previousPage', () => {
    beforeEach(() => {
      pagination.previousPage();
    });

    it('dispatches #previousPage', () => {
      expect(engine.actions).toContainEqual(previousPage());
    });

    it('dispatches #fetchResultsActionCreator', () => {
      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });
});
