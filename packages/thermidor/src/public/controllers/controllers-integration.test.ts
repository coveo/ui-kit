import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {buildSearchBoxController} from './search-box/search-box-controller.js';
import {buildPaginationController} from './pagination/pagination-controller.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';

describe('Supports<F> structural compatibility', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  describe('SearchBoxController with SearchInterface', () => {
    it('setQuery updates the controller state', () => {
      const searchInterface = buildSearchInterface({engine});
      const controller = buildSearchBoxController({interface: searchInterface});

      controller.setQuery({query: 'laptops'});

      expect(controller.state.query).toBe('laptops');
    });

    it('state starts with an empty query', () => {
      const searchInterface = buildSearchInterface({engine});
      const controller = buildSearchBoxController({interface: searchInterface});

      expect(controller.state.query).toBe('');
      expect(controller.state.isLoading).toBe(false);
      expect(controller.state.error).toBeNull();
    });

    it('submit dispatches thunks and returns promises', async () => {
      const searchInterface = buildSearchInterface({engine});
      const controller = buildSearchBoxController({interface: searchInterface});

      controller.setQuery({query: 'test'});
      const result = controller.submit();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('PaginationController with SearchInterface', () => {
    it('state has page, pageSize, totalCount, and totalPages', () => {
      const searchInterface = buildSearchInterface({engine});
      const controller = buildPaginationController({
        interface: searchInterface,
      });

      expect(controller.state).toHaveProperty('page');
      expect(controller.state).toHaveProperty('pageSize');
      expect(controller.state).toHaveProperty('totalCount');
      expect(controller.state).toHaveProperty('totalPages');
    });

    it('initial state has default pagination values', () => {
      const searchInterface = buildSearchInterface({engine});
      const controller = buildPaginationController({
        interface: searchInterface,
      });

      expect(controller.state.page).toBe(0);
      expect(controller.state.pageSize).toBe(10);
      expect(controller.state.totalCount).toBe(0);
      expect(controller.state.totalPages).toBe(0);
    });

    it('setPageSize updates the page size', () => {
      const searchInterface = buildSearchInterface({engine, id: 'pag-test'});
      const controller = buildPaginationController({
        interface: searchInterface,
      });

      const fullEngine = getFullEngine(engine);
      const actions = getOrCreatePaginationActions(searchInterface);
      fullEngine.mutate(actions.setTotalCount(100));

      controller.setPageSize(20);

      expect(controller.state.pageSize).toBe(20);
    });

    it('selectPage updates the current page', () => {
      const searchInterface = buildSearchInterface({engine, id: 'pag-nav'});
      const controller = buildPaginationController({
        interface: searchInterface,
      });

      const fullEngine = getFullEngine(engine);
      const actions = getOrCreatePaginationActions(searchInterface);
      fullEngine.mutate(actions.setTotalCount(100));

      controller.selectPage(2);

      expect(controller.state.page).toBe(2);
    });
  });
});
