import {
  selectPage,
  nextPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildCorePagination,
  Pagination,
} from './headless-core-commerce-pagination';

jest.mock('../../../../features/commerce/pagination/pagination-actions');

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('core pagination', () => {
  let engine: MockedCommerceEngine;
  let pagination: Pagination;

  function initPagination() {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    pagination = buildCorePagination(engine, {
      fetchResultsActionCreator: fetchProductListing,
    });
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
      expect(selectPage).toHaveBeenCalledWith(0);
    });

    it('dispatches #fetchProductListing', () => {
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#nextPage', () => {
    beforeEach(() => {
      pagination.nextPage();
    });

    it('dispatches #nextPage', () => {
      expect(nextPage).toHaveBeenCalled();
    });

    it('dispatches #fetchProductListing', () => {
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });

  describe('#previousPage', () => {
    beforeEach(() => {
      pagination.previousPage();
    });

    it('dispatches #previousPage', () => {
      expect(previousPage).toHaveBeenCalled();
    });

    it('dispatches #fetchProductListing', () => {
      expect(fetchProductListing).toHaveBeenCalled();
    });
  });
});
