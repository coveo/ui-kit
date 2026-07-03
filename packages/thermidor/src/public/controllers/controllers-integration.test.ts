import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {
  composeInterfaces,
  getComposedInternals,
} from '@/src/public/interfaces/compose.js';
import {buildSearchBoxController} from './search-box/search-box-controller.js';
import {buildPaginationController} from './pagination/pagination-controller.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';

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

  describe('SearchBoxController with ComposedInterface', () => {
    it('setQuery works on a composed interface with two sub-interfaces', () => {
      const searchA = buildSearchInterface({engine});
      const searchB = buildSearchInterface({engine});
      const composed = composeInterfaces({interfaces: [searchA, searchB]});

      const controller = buildSearchBoxController({interface: composed});

      controller.setQuery({query: 'composed query'});

      expect(controller.state.query).toBe('composed query');
    });

    it('submit dispatches to all sub-interfaces', async () => {
      const searchA = buildSearchInterface({engine});
      const searchB = buildSearchInterface({engine});
      const composed = composeInterfaces({interfaces: [searchA, searchB]});

      const controller = buildSearchBoxController({interface: composed});

      controller.setQuery({query: 'multi'});
      const result = controller.submit();

      expect(result).toBeInstanceOf(Promise);
      const resolved = await result;
      expect(resolved).toHaveLength(2);
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

  describe('PaginationController with ComposedInterface', () => {
    it('works with a composed interface', () => {
      const searchA = buildSearchInterface({engine});
      const searchB = buildSearchInterface({engine});
      const composed = composeInterfaces({interfaces: [searchA, searchB]});

      const controller = buildPaginationController({interface: composed});

      expect(controller.state.page).toBe(0);
      expect(controller.state.pageSize).toBe(10);
      expect(controller.state.totalCount).toBe(0);
      expect(controller.state.totalPages).toBe(0);
    });

    it('setPageSize works with a composed interface', () => {
      const searchA = buildSearchInterface({engine, id: 'comp-pag-a'});
      const searchB = buildSearchInterface({engine, id: 'comp-pag-b'});
      const composed = composeInterfaces({interfaces: [searchA, searchB]});

      const controller = buildPaginationController({interface: composed});

      const fullEngine = getFullEngine(engine);
      const actions = getOrCreatePaginationActions(composed);
      fullEngine.mutate(actions.setTotalCount(50));

      controller.setPageSize(25);

      expect(controller.state.pageSize).toBe(25);
    });
  });
});
