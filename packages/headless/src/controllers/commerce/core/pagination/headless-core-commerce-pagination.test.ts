import {
  selectPage,
  nextPage,
  previousPage,
  setPageSize,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  buildCorePagination,
  CorePaginationProps,
  Pagination,
} from './headless-core-commerce-pagination';

jest.mock('../../../../features/commerce/pagination/pagination-actions');

describe('core pagination', () => {
  let engine: MockedCommerceEngine;
  let pagination: Pagination;
  const fetchResultsActionCreator = jest.fn();

  function initPagination(props: Partial<CorePaginationProps> = {}) {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    pagination = buildCorePagination(engine, {
      fetchResultsActionCreator,
      ...props,
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
      initPagination({
        options: {pageSize},
      });
      expect(setPageSize).toHaveBeenCalledWith({pageSize});
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
