import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Engine, FullEngine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {buildPaginationController} from './pagination-controller.js';

describe('pagination controller', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: ReturnType<typeof buildSearchInterface>;
  let paginationActions: ReturnType<typeof getOrCreatePaginationActions>;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
    paginationActions = getOrCreatePaginationActions(searchInterface);
  });

  describe('buildPaginationController', () => {
    it('returns a controller with correct initial state', () => {
      const controller = buildPaginationController({interface: searchInterface});

      expect(controller.state).toEqual({
        page: 0,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      });
    });
  });

  describe('selectPage', () => {
    it('passes actionIntent with select_page and target page', async () => {
      const controller = buildPaginationController({interface: searchInterface});
      fullEngine.mutate(paginationActions.setTotalCount(100));
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      controller.selectPage(2);

      const thunkResult = mutateSpy.mock.results.find(
        (r) => r.value && typeof r.value === 'object' && 'then' in r.value
      );

      expect(thunkResult).toBeDefined();
      const resolved = await thunkResult!.value;
      expect(resolved?.meta?.arg?.actionIntent).toEqual({
        name: 'select_page',
        context: {page: 2},
      });
    });

    it('does not dispatch thunk when page is out of range', () => {
      const controller = buildPaginationController({interface: searchInterface});
      fullEngine.mutate(paginationActions.setTotalCount(100));
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      controller.selectPage(99);

      const thunkResult = mutateSpy.mock.results.find(
        (r) => r.value && typeof r.value === 'object' && 'then' in r.value
      );

      expect(thunkResult).toBeUndefined();
    });

    it('does not dispatch thunk when selecting current page', () => {
      const controller = buildPaginationController({interface: searchInterface});
      fullEngine.mutate(paginationActions.setTotalCount(100));
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      controller.selectPage(0);

      const thunkResult = mutateSpy.mock.results.find(
        (r) => r.value && typeof r.value === 'object' && 'then' in r.value
      );

      expect(thunkResult).toBeUndefined();
    });
  });

  describe('setPageSize', () => {
    it('passes actionIntent with set_page_size and the new page size', async () => {
      const controller = buildPaginationController({interface: searchInterface});
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      controller.setPageSize(25);

      const thunkResult = mutateSpy.mock.results.find(
        (r) => r.value && typeof r.value === 'object' && 'then' in r.value
      );

      expect(thunkResult).toBeDefined();
      const resolved = await thunkResult!.value;
      expect(resolved?.meta?.arg?.actionIntent).toEqual({
        name: 'set_page_size',
        context: {pageSize: 25},
      });
    });

    it('does not dispatch thunk when pageSize is less than 1', () => {
      const controller = buildPaginationController({interface: searchInterface});
      const mutateSpy = vi.spyOn(fullEngine, 'mutate');

      controller.setPageSize(0);

      const thunkResult = mutateSpy.mock.results.find(
        (r) => r.value && typeof r.value === 'object' && 'then' in r.value
      );

      expect(thunkResult).toBeUndefined();
    });
  });

  describe('subscribe', () => {
    it('notifies on state changes', () => {
      const controller = buildPaginationController({interface: searchInterface});
      const callback = vi.fn();

      controller.subscribe(callback);
      fullEngine.mutate(paginationActions.setTotalCount(50));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
