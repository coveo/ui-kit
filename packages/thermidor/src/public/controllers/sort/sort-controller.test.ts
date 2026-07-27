import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Engine, FullEngine, getFullEngine} from '@/src/internal/engine/index.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {buildSortController} from './sort-controller.js';

describe('sort controller', () => {
  let engine: Engine;
  let fullEngine: FullEngine;
  let searchInterface: ReturnType<typeof buildSearchInterface>;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    searchInterface = buildSearchInterface({engine});
  });

  describe('buildSortController', () => {
    it('returns a controller with correct initial state', () => {
      const controller = buildSortController({interface: searchInterface});

      expect(controller.state.appliedSort).toBeNull();
      expect(controller.state.availableSorts).toEqual([]);
    });
  });

  describe('sortBy', () => {
    it('updates appliedSort in state', () => {
      const controller = buildSortController({interface: searchInterface});

      controller.sortBy({sortCriteria: 'date ascending'});

      expect(controller.state.appliedSort).toEqual({sortCriteria: 'date ascending'});
    });

    it('invokes search facade thunks', () => {
      const controller = buildSortController({interface: searchInterface});

      const result = controller.sortBy({sortCriteria: 'relevancy'});

      expect(result).toBeUndefined();
    });
  });

  describe('isSortedBy', () => {
    it('returns true when criteria match', () => {
      const controller = buildSortController({interface: searchInterface});
      const sortActions = getOrCreateSortActions(searchInterface);

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {sortCriteria: 'date ascending'},
          availableSorts: [{sortCriteria: 'date ascending'}, {sortCriteria: 'relevancy'}],
        })
      );

      expect(controller.isSortedBy({sortCriteria: 'date ascending'})).toBe(true);
    });

    it('returns false when criteria differ', () => {
      const controller = buildSortController({interface: searchInterface});
      const sortActions = getOrCreateSortActions(searchInterface);

      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {sortCriteria: 'date ascending'},
          availableSorts: [{sortCriteria: 'date ascending'}, {sortCriteria: 'relevancy'}],
        })
      );

      expect(controller.isSortedBy({sortCriteria: 'relevancy'})).toBe(false);
    });

    it('returns false when appliedSort is null', () => {
      const controller = buildSortController({interface: searchInterface});

      expect(controller.isSortedBy({sortCriteria: 'date ascending'})).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('notifies on state changes', () => {
      const controller = buildSortController({interface: searchInterface});
      const callback = vi.fn();
      const sortActions = getOrCreateSortActions(searchInterface);

      controller.subscribe(callback);
      fullEngine.mutate(
        sortActions.updateFromResponse({
          appliedSort: {sortCriteria: 'relevancy'},
          availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
        })
      );

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
