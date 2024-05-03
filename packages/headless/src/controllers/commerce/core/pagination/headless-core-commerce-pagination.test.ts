import {
  selectPage,
  nextPage,
  previousPage,
  setPageSize,
  registerRecommendationsSlotPagination,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildCorePagination,
  CorePaginationOptions,
  Pagination,
} from './headless-core-commerce-pagination';

jest.mock('../../../../features/commerce/pagination/pagination-actions');

describe('core pagination', () => {
  let engine: MockedCommerceEngine;
  let pagination: Pagination;
  const fetchResultsActionCreator = jest.fn();
  const slotId = 'recommendations-slot-id';

  function initPagination(options: CorePaginationOptions = {}) {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    pagination = buildCorePagination(engine, {
      fetchResultsActionCreator,
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
      engine.state.commercePagination.recommendations['slot-id'] = {
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
      engine.state.commercePagination.principal = {
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

    it('dispatches #fetchResultsActionCreator', () => {
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#nextPage', () => {
    beforeEach(() => {
      pagination.nextPage();
    });

    it('dispatches #nextPage', () => {
      expect(nextPage).toHaveBeenCalled();
    });

    it('dispatches #fetchResultsActionCreator', () => {
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#previousPage', () => {
    beforeEach(() => {
      pagination.previousPage();
    });

    it('dispatches #previousPage', () => {
      expect(previousPage).toHaveBeenCalled();
    });

    it('dispatches #fetchResultsActionCreator', () => {
      expect(fetchResultsActionCreator).toHaveBeenCalled();
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

    it('dispatches #fetchResultsActionCreator', () => {
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });
});
