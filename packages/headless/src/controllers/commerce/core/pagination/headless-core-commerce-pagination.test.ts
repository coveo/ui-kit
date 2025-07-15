import {stateKey} from '../../../../app/state-key.js';
import {
  nextPage,
  previousPage,
  registerRecommendationsSlotPagination,
  selectPage,
  setPageSize,
} from '../../../../features/commerce/pagination/pagination-actions.js';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {
  buildCorePagination,
  type CorePaginationOptions,
  type Pagination,
} from './headless-core-commerce-pagination.js';

vi.mock('../../../../features/commerce/pagination/pagination-actions');

describe('core pagination', () => {
  let engine: MockedCommerceEngine;
  let pagination: Pagination;
  const fetchProductsActionCreator = vi.fn();
  const fetchMoreProductsActionCreator = vi.fn();
  const slotId = 'recommendations-slot-id';

  function initPagination(options: CorePaginationOptions = {}) {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    pagination = buildCorePagination(engine, {
      fetchProductsActionCreator,
      fetchMoreProductsActionCreator,
      options,
    });
  }

  beforeEach(() => {
    initPagination();
  });

  it('exposes #subscribe method', () => {
    expect(pagination.subscribe).toBeTruthy();
  });

  describe('initialization', () => {
    it('adds correct reducers to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        commercePagination,
      });
    });

    it('does not set page size when not provided', () => {
      expect(setPageSize).not.toHaveBeenCalled();
    });

    it('sets page size when provided', () => {
      const pageSize = 11;
      initPagination({pageSize});
      expect(setPageSize).toHaveBeenCalledWith({pageSize});
    });

    it('when slot id is provided, registers recommendation slot pagination', () => {
      initPagination({slotId});
      expect(registerRecommendationsSlotPagination).toHaveBeenCalledWith({
        slotId,
      });
    });
  });

  describe('#state', () => {
    it('when slot id is specified, reflects the recommendations slot pagination state', () => {
      initPagination({slotId: 'slot-id'});
      engine[stateKey].commercePagination.recommendations['slot-id'] = {
        perPage: 111,
        page: 111,
        totalEntries: 111,
        totalPages: 111,
      };
      expect(pagination.state).toEqual({
        pageSize: 111,
        page: 111,
        totalEntries: 111,
        totalPages: 111,
      });
    });

    it('when slot id is not specified, reflects the principal pagination state', () => {
      engine[stateKey].commercePagination.principal = {
        perPage: 222,
        page: 222,
        totalEntries: 222,
        totalPages: 222,
      };
      expect(pagination.state).toEqual({
        pageSize: 222,
        page: 222,
        totalEntries: 222,
        totalPages: 222,
      });
    });
  });

  describe('#selectPage', () => {
    beforeEach(() => {
      pagination.selectPage(0);
    });

    it('dispatches #selectPage', () => {
      expect(selectPage).toHaveBeenCalledWith({page: 0});
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#nextPage', () => {
    beforeEach(() => {
      pagination.nextPage();
    });

    it('dispatches #nextPage', () => {
      expect(nextPage).toHaveBeenCalled();
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#previousPage', () => {
    beforeEach(() => {
      pagination.previousPage();
    });

    it('dispatches #previousPage', () => {
      expect(previousPage).toHaveBeenCalled();
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#setPageSize', () => {
    const pageSize = 10;
    beforeEach(() => {
      pagination.setPageSize(pageSize);
    });

    it('dispatches #setPageSize', () => {
      expect(setPageSize).toHaveBeenCalledWith({pageSize});
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#fetchMoreProducts', () => {
    it('dispatches #fetchMoreProductsActionCreator', () => {
      pagination.fetchMoreProducts();
      expect(fetchMoreProductsActionCreator).toHaveBeenCalled();
    });
  });
});
